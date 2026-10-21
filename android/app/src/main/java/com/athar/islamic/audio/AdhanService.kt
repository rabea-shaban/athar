package com.athar.islamic.audio

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.util.Log
import com.athar.islamic.R
import com.athar.islamic.notifications.NotificationHelper

class AdhanService : Service(), AudioManager.OnAudioFocusChangeListener {

    companion object {
        const val TAG = "ATHAR_AdhanService"
        const val ACTION_START_ADHAN = "com.athar.islamic.START_ADHAN"
        const val ACTION_STOP_ADHAN = "com.athar.islamic.STOP_ADHAN"
        const val EXTRA_PRAYER_NAME = "extra_prayer_name"
        const val EXTRA_SOUND_URL = "extra_sound_url"

        private var playing = false
        fun isAdhanPlaying(): Boolean = playing
    }

    private var mediaPlayer: MediaPlayer? = null
    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
        NotificationHelper.createNotificationChannels(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START_ADHAN

        if (action == ACTION_STOP_ADHAN) {
            Log.d(TAG, "[ATHAR][Adhan] Stopping Adhan via user action.")
            stopAdhanService()
            return START_NOT_STICKY
        }

        val prayerNameAr = intent?.getStringExtra(EXTRA_PRAYER_NAME) ?: "الصلاة"
        val soundUrl = intent?.getStringExtra(EXTRA_SOUND_URL)
        Log.d(TAG, "[ATHAR][Adhan] Starting Adhan service for $prayerNameAr (soundUrl=$soundUrl)")

        startAdhanPlayback(prayerNameAr, soundUrl)
        return START_NOT_STICKY
    }

    private fun getAdhanVolumeFloat(): Float {
        try {
            val prefs = getSharedPreferences("athar_native_prefs", MODE_PRIVATE)
            val volPercent = prefs.getInt("key_adhan_volume", 100)
            return (volPercent.coerceIn(0, 100) / 100.0f)
        } catch (e: Exception) {
            Log.w(TAG, "[ATHAR][Adhan] Error reading volume prefs: ${e.message}")
            return 1.0f
        }
    }

    private fun startAdhanPlayback(prayerNameAr: String, soundUrl: String?) {
        if (playing) {
            stopAdhanService()
        }

        val notification = NotificationHelper.buildAdhanNotification(this, prayerNameAr).build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NotificationHelper.NOTIF_ID_ADHAN,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            )
        } else {
            startForeground(NotificationHelper.NOTIF_ID_ADHAN, notification)
        }

        requestAudioFocus()

        val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .build()

        val floatVol = getAdhanVolumeFloat()
        Log.d(TAG, "[ATHAR][Adhan] Applying player gain volume on STREAM_MUSIC: $floatVol")

        if (!soundUrl.isNullOrEmpty() && soundUrl.startsWith("http")) {
            try {
                mediaPlayer = MediaPlayer().apply {
                    setAudioAttributes(audioAttributes)
                    setDataSource(soundUrl)
                    setOnPreparedListener { mp ->
                        Log.d(TAG, "[ATHAR][Adhan] Online Adhan audio prepared successfully. Starting playback.")
                        mp.setVolume(floatVol, floatVol)
                        playing = true
                        mp.start()
                    }
                    setOnCompletionListener {
                        Log.d(TAG, "[ATHAR][Adhan] Adhan playback completed.")
                        stopAdhanService()
                    }
                    setOnErrorListener { _, what, extra ->
                        Log.w(TAG, "[ATHAR][Adhan] Online MediaPlayer error (what=$what, extra=$extra). Falling back to local Adhan.")
                        playLocalAdhanFallback(audioAttributes)
                        true
                    }
                    prepareAsync()
                }
                return
            } catch (e: Exception) {
                Log.w(TAG, "[ATHAR][Adhan] Exception trying online audio ($soundUrl): ${e.message}. Using local asset.")
            }
        }

        playLocalAdhanFallback(audioAttributes)
    }

    private fun playLocalAdhanFallback(audioAttributes: AudioAttributes) {
        try {
            mediaPlayer?.release()
            val floatVol = getAdhanVolumeFloat()
            mediaPlayer = MediaPlayer.create(this, R.raw.adhan)?.apply {
                setAudioAttributes(audioAttributes)
                setVolume(floatVol, floatVol)
                setOnCompletionListener {
                    Log.d(TAG, "[ATHAR][Adhan] Local Adhan completed.")
                    stopAdhanService()
                }
                setOnErrorListener { _, what, extra ->
                    Log.e(TAG, "[ATHAR][Adhan] Local MediaPlayer error: $what, $extra")
                    stopAdhanService()
                    true
                }
                start()
            }
            playing = true
        } catch (e: Exception) {
            Log.e(TAG, "[ATHAR][Adhan] Failed to start local MediaPlayer: ${e.message}", e)
            stopAdhanService()
        }
    }

    private fun requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()

            focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(audioAttributes)
                .setAcceptsDelayedFocusGain(false)
                .setOnAudioFocusChangeListener(this)
                .build()

            audioManager?.requestAudioFocus(focusRequest!!)
        } else {
            @Suppress("DEPRECATION")
            audioManager?.requestAudioFocus(
                this,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            )
        }
    }

    private fun abandonAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            focusRequest?.let { audioManager?.abandonAudioFocusRequest(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager?.abandonAudioFocus(this)
        }
    }

    override fun onAudioFocusChange(focusChange: Int) {
        when (focusChange) {
            AudioManager.AUDIOFOCUS_LOSS, AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                Log.d(TAG, "[ATHAR][Adhan] Lost audio focus. Pausing Adhan.")
                mediaPlayer?.pause()
            }
            AudioManager.AUDIOFOCUS_GAIN -> {
                Log.d(TAG, "[ATHAR][Adhan] Regained audio focus. Resuming Adhan.")
                mediaPlayer?.start()
            }
        }
    }

    private fun stopAdhanService() {
        playing = false
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
        } catch (e: Exception) {
            Log.w(TAG, "[ATHAR][Adhan] Error releasing MediaPlayer: ${e.message}")
        } finally {
            mediaPlayer = null
        }

        abandonAudioFocus()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        stopAdhanService()
        super.onDestroy()
    }
}
