package com.athar.islamic.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.MediaPlayer
import android.os.Build
import android.util.Log
import com.athar.islamic.R
import com.athar.islamic.audio.AdhanService
import com.athar.islamic.notifications.NotificationHelper
import com.athar.islamic.prayer.PrayerScheduleManager

class PrayerAlarmReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "ATHAR_AlarmReceiver"
        const val ACTION_ADHAN = "com.athar.islamic.ACTION_ADHAN"
        const val ACTION_PRE_PRAYER = "com.athar.islamic.ACTION_PRE_PRAYER"
        const val ACTION_SALAWAT = "com.athar.islamic.ACTION_SALAWAT"

        const val EXTRA_PRAYER_KEY = "extra_prayer_key"
        const val EXTRA_PRAYER_NAME = "extra_prayer_name"
        const val EXTRA_PRE_MINUTES = "extra_pre_minutes"
        const val EXTRA_SOUND_URL = "extra_sound_url"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d(TAG, "[ATHAR][AlarmReceiver] Received alarm broadcast: action=$action")

        NotificationHelper.createNotificationChannels(context)

        // Auto-check and renew upcoming 7-day prayer alarms natively if running low
        try {
            PrayerScheduleManager.checkAndAutoRenewSchedulesIfNeeded(context)
        } catch (e: Exception) {
            Log.w(TAG, "[ATHAR][AlarmReceiver] Auto-renew check error: ${e.message}")
        }

        when (action) {
            ACTION_ADHAN -> {
                val prayerNameAr = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "الصلاة"
                val soundUrl = intent.getStringExtra(EXTRA_SOUND_URL)
                val serviceIntent = Intent(context, AdhanService::class.java).apply {
                    this.action = AdhanService.ACTION_START_ADHAN
                    putExtra(AdhanService.EXTRA_PRAYER_NAME, prayerNameAr)
                    if (!soundUrl.isNullOrEmpty()) {
                        putExtra(AdhanService.EXTRA_SOUND_URL, soundUrl)
                    }
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }

            ACTION_PRE_PRAYER -> {
                val prayerNameAr = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "الصلاة"
                val preMinutes = intent.getIntExtra(EXTRA_PRE_MINUTES, 15)

                NotificationHelper.showNotification(
                    context,
                    NotificationHelper.NOTIF_ID_PREP,
                    NotificationHelper.CHANNEL_PREP,
                    "اقترب موعد صلاة $prayerNameAr",
                    "متبقي $preMinutes دقيقة على أذان صلاة $prayerNameAr",
                    "/prayer/times"
                )
            }

            ACTION_SALAWAT -> {
                try {
                    val mediaPlayer = MediaPlayer.create(context, R.raw.salawat)
                    mediaPlayer?.setOnCompletionListener { mp ->
                        try { mp.release() } catch (e: Exception) {}
                    }
                    mediaPlayer?.start()
                    Log.d(TAG, "[ATHAR][Salawat] Playing salawat audio successfully.")
                } catch (e: Exception) {
                    Log.e(TAG, "[ATHAR][Salawat] Error playing salawat audio: ${e.message}", e)
                }

                NotificationHelper.showNotification(
                    context,
                    NotificationHelper.NOTIF_ID_SALAWAT,
                    NotificationHelper.CHANNEL_SALAWAT,
                    "الصلاة على النبي ﷺ",
                    "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
                    "/adhkar/salawat"
                )
            }
        }
    }
}
