package com.athar.islamic.bridge

import android.content.Context
import android.content.Intent
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.athar.islamic.R
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.athar.islamic.audio.AdhanService
import com.athar.islamic.compass.QiblaCompassManager
import com.athar.islamic.notifications.NotificationHelper
import com.athar.islamic.prayer.PrayerScheduleManager

class AtharNativeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var previewMediaPlayer: MediaPlayer? = null
    private val compassManager: QiblaCompassManager by lazy {
        QiblaCompassManager(reactContext)
    }

    override fun getName(): String = "AtharNativeModule"

    @ReactMethod
    fun initializeEngine() {
        NotificationHelper.createNotificationChannels(reactContext)
    }

    @ReactMethod
    fun saveCalculationParams(
        latitude: Double,
        longitude: Double,
        methodName: String,
        madhabName: String,
        prePrayerMinutes: Int,
        soundUrl: String?,
        fajrSoundUrl: String?,
        fajr: Boolean,
        dhuhr: Boolean,
        asr: Boolean,
        maghrib: Boolean,
        isha: Boolean
    ) {
        PrayerScheduleManager.saveCalculationParams(
            reactContext,
            latitude,
            longitude,
            methodName,
            madhabName,
            prePrayerMinutes,
            soundUrl,
            fajrSoundUrl,
            fajr,
            dhuhr,
            asr,
            maghrib,
            isha
        )
    }

    @ReactMethod
    fun schedulePrayerTimes(jsonSchedule: String) {
        PrayerScheduleManager.scheduleAllFromJson(reactContext, jsonSchedule)
    }

    @ReactMethod
    fun scheduleSalawat(enabled: Boolean, intervalHours: Double, startHour: Int, endHour: Int) {
        PrayerScheduleManager.scheduleSalawatReminders(
            reactContext,
            enabled,
            intervalHours,
            startHour,
            endHour
        )
    }

    @ReactMethod
    fun startSalawatTest() {
        try {
            val mediaPlayer = MediaPlayer.create(reactContext, R.raw.salawat)
            mediaPlayer?.setOnCompletionListener { mp ->
                try { mp.release() } catch (e: Exception) {}
            }
            mediaPlayer?.start()
        } catch (e: Exception) {
            Log.e("AtharNativeModule", "Error testing salawat audio: ${e.message}", e)
        }

        NotificationHelper.createNotificationChannels(reactContext)
        NotificationHelper.showNotification(
            reactContext,
            NotificationHelper.NOTIF_ID_SALAWAT,
            NotificationHelper.CHANNEL_SALAWAT,
            "الصلاة على النبي ﷺ",
            "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
            "/adhkar/salawat"
        )
    }

    @ReactMethod
    fun cancelAllSchedules() {
        PrayerScheduleManager.cancelAllSchedules(reactContext)
    }

    @ReactMethod
    fun startAdhanTest(prayerNameAr: String, soundUrl: String? = null) {
        val intent = Intent(reactContext, AdhanService::class.java).apply {
            action = AdhanService.ACTION_START_ADHAN
            putExtra(AdhanService.EXTRA_PRAYER_NAME, prayerNameAr)
            if (!soundUrl.isNullOrEmpty()) {
                putExtra(AdhanService.EXTRA_SOUND_URL, soundUrl)
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun scheduleTestAdhanInOneMinute(prayerNameAr: String, soundUrl: String? = null) {
        PrayerScheduleManager.scheduleTestAdhanInOneMinute(reactContext, prayerNameAr, soundUrl)
    }

    @ReactMethod
    fun stopAdhan() {
        val intent = Intent(reactContext, AdhanService::class.java).apply {
            action = AdhanService.ACTION_STOP_ADHAN
        }
        reactContext.startService(intent)
    }

    @ReactMethod
    fun setAdhanVolume(volumePercent: Int) {
        try {
            val prefs = reactContext.getSharedPreferences("athar_native_prefs", Context.MODE_PRIVATE)
            val clamped = volumePercent.coerceIn(0, 100)
            prefs.edit().putInt("key_adhan_volume", clamped).apply()
            Log.d("AtharNativeModule", "Saved native Adhan volume: $clamped%")
        } catch (e: Exception) {
            Log.e("AtharNativeModule", "Error saving Adhan volume: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAdhanVolume(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("athar_native_prefs", Context.MODE_PRIVATE)
            val vol = prefs.getInt("key_adhan_volume", 100)
            promise.resolve(vol)
        } catch (e: Exception) {
            promise.reject("GET_ADHAN_VOLUME_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startAdhanVolumePreview(volumePercent: Int) {
        try {
            stopAdhanVolumePreview()
            val floatVol = (volumePercent.coerceIn(0, 100) / 100.0f)
            previewMediaPlayer = MediaPlayer.create(reactContext, R.raw.adhan)?.apply {
                setVolume(floatVol, floatVol)
                setOnCompletionListener { mp ->
                    try { mp.release() } catch (e: Exception) {}
                }
                start()
            }
        } catch (e: Exception) {
            Log.e("AtharNativeModule", "Error testing Adhan volume preview: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopAdhanVolumePreview() {
        try {
            previewMediaPlayer?.stop()
            previewMediaPlayer?.release()
        } catch (e: Exception) {
            // ignore
        } finally {
            previewMediaPlayer = null
        }
    }

    @ReactMethod
    fun startQiblaCompass(latitude: Double, longitude: Double) {
        try {
            compassManager.start(latitude, longitude)
        } catch (e: Exception) {
            Log.e("AtharNativeModule", "Error starting Qibla compass: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopQiblaCompass() {
        try {
            compassManager.stop()
        } catch (e: Exception) {
            Log.e("AtharNativeModule", "Error stopping Qibla compass: ${e.message}", e)
        }
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        try {
            val status = PrayerScheduleManager.canScheduleExactAlarms(reactContext)
            promise.resolve(status)
        } catch (e: Exception) {
            promise.reject("EXACT_ALARM_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                data = Uri.parse("package:${reactContext.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
        } else {
            openAppNotificationSettings()
        }
    }

    @ReactMethod
    fun openBatteryOptimizationSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
        }
    }

    private fun openAppNotificationSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.parse("package:${reactContext.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }
}
