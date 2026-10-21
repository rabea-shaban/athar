package com.athar.islamic.compass

import android.content.Context
import android.hardware.GeomagneticField
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class QiblaCompassManager(private val reactContext: ReactApplicationContext) : SensorEventListener {

    private val sensorManager: SensorManager =
        reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager

    private var rotationVectorSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    private var accelerometerSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private var magnetometerSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    private val rotationMatrix = FloatArray(9)
    private val orientation = FloatArray(3)

    private var gravityValues: FloatArray? = null
    private var magneticValues: FloatArray? = null

    private var userLat: Double = 0.0
    private var userLng: Double = 0.0
    private var declination: Float = 0f
    private var currentSensorAccuracy: Int = SensorManager.SENSOR_STATUS_ACCURACY_HIGH

    private var smoothedSin = 0.0
    private var smoothedCos = 0.0
    private var hasFirstSample = false
    private var isListening = false
    private var lastEmitTime = 0L

    fun start(latitude: Double, longitude: Double) {
        if (isListening) stop()

        userLat = latitude
        userLng = longitude

        // Validate coordinate bounds: lat [-90, 90], lng [-180, 180]
        if (latitude in -90.0..90.0 && longitude in -180.0..180.0) {
            try {
                val geoField = GeomagneticField(
                    latitude.toFloat(),
                    longitude.toFloat(),
                    0f,
                    System.currentTimeMillis()
                )
                declination = geoField.declination
                Log.d("QiblaCompassManager", "Calculated geomagnetic declination: $declination° for ($latitude, $longitude)")
            } catch (e: Exception) {
                Log.w("QiblaCompassManager", "GeomagneticField calculation error: ${e.message}")
            }
        }

        smoothedSin = 0.0
        smoothedCos = 0.0
        hasFirstSample = false

        var registered = false
        if (rotationVectorSensor != null) {
            registered = sensorManager.registerListener(this, rotationVectorSensor, SensorManager.SENSOR_DELAY_GAME)
        }

        if (!registered && accelerometerSensor != null && magnetometerSensor != null) {
            val r1 = sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_GAME)
            val r2 = sensorManager.registerListener(this, magnetometerSensor, SensorManager.SENSOR_DELAY_GAME)
            registered = r1 && r2
        }

        isListening = registered

        if (!registered) {
            Log.w("QiblaCompassManager", "No compatible compass hardware sensors found on device.")
            emitHeadingEvent(0.0, 0.0, 0, false)
        }
    }

    fun stop() {
        if (isListening) {
            sensorManager.unregisterListener(this)
            isListening = false
            gravityValues = null
            magneticValues = null
            hasFirstSample = false
        }
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (!isListening) return

        var magneticHeading = 0.0
        var hasHeading = false

        if (event.accuracy != SensorManager.SENSOR_STATUS_UNRELIABLE) {
            currentSensorAccuracy = event.accuracy
        }

        if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
            SensorManager.getOrientation(rotationMatrix, orientation)
            magneticHeading = Math.toDegrees(orientation[0].toDouble())
            hasHeading = true
        } else {
            if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
                gravityValues = event.values.clone()
            } else if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
                magneticValues = event.values.clone()
            }

            val g = gravityValues
            val m = magneticValues
            if (g != null && m != null) {
                val r = FloatArray(9)
                val i = FloatArray(9)
                if (SensorManager.getRotationMatrix(r, i, g, m)) {
                    SensorManager.getOrientation(r, orientation)
                    magneticHeading = Math.toDegrees(orientation[0].toDouble())
                    hasHeading = true
                }
            }
        }

        if (hasHeading) {
            val magHeadingPositive = (magneticHeading + 360) % 360
            val rad = Math.toRadians(magHeadingPositive)

            if (!hasFirstSample) {
                smoothedSin = Math.sin(rad)
                smoothedCos = Math.cos(rad)
                hasFirstSample = true
            } else {
                val alpha = 0.15 // Circular Exponential Smoothing
                smoothedSin = alpha * Math.sin(rad) + (1.0 - alpha) * smoothedSin
                smoothedCos = alpha * Math.cos(rad) + (1.0 - alpha) * smoothedCos
            }

            val smoothedMagHeading = (Math.toDegrees(Math.atan2(smoothedSin, smoothedCos)) + 360) % 360
            val trueHeading = (smoothedMagHeading + declination + 360) % 360

            // Throttle UI updates to max 30 FPS (every 33ms)
            val now = System.currentTimeMillis()
            if (now - lastEmitTime >= 33) {
                lastEmitTime = now
                emitHeadingEvent(smoothedMagHeading, trueHeading, currentSensorAccuracy, true)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        if (accuracy != SensorManager.SENSOR_STATUS_UNRELIABLE) {
            currentSensorAccuracy = accuracy
        }
    }

    private fun emitHeadingEvent(magneticHeading: Double, trueHeading: Double, accuracy: Int, isAvailable: Boolean) {
        try {
            val params = Arguments.createMap().apply {
                putDouble("magneticHeading", Math.round(magneticHeading * 10) / 10.0)
                putDouble("trueHeading", Math.round(trueHeading * 10) / 10.0)
                putDouble("declination", declination.toDouble())
                putInt("accuracy", accuracy)
                putBoolean("isAvailable", isAvailable)
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onQiblaHeadingUpdate", params)
        } catch (e: Exception) {
            Log.w("QiblaCompassManager", "Emit event error: ${e.message}")
        }
    }
}
