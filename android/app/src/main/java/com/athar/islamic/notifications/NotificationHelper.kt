package com.athar.islamic.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.athar.islamic.MainActivity
import com.athar.islamic.R
import com.athar.islamic.audio.AdhanService

object NotificationHelper {
    const val CHANNEL_ADHAN = "athar_adhan_channel"
    const val CHANNEL_PREP = "athar_prep_channel"
    const val CHANNEL_SALAWAT = "athar_salawat_v2_channel"
    const val CHANNEL_GENERAL = "athar_general_channel"

    const val NOTIF_ID_ADHAN = 1001
    const val NOTIF_ID_PREP = 1002
    const val NOTIF_ID_SALAWAT = 1003

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            try {
                notificationManager.deleteNotificationChannel("athar_salawat_channel")
            } catch (e: Exception) {
                // ignore
            }

            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build()

            // 1. Adhan & Exact Prayer Channel
            val adhanChannel = NotificationChannel(
                CHANNEL_ADHAN,
                "تنبيهات الأذان ومواقيت الصلاة",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "قناة إشعارات دخول وقت الصلاة وتشغيل الأذان"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250, 500)
                enableLights(true)
                lightColor = 0xFF10B981.toInt()
                setSound(null, null) // Audio played by AdhanService
            }

            // 2. Pre-Prayer Channel
            val prepChannel = NotificationChannel(
                CHANNEL_PREP,
                "التذكير قبل دخول وقت الصلاة",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "قناة التذكيرات قبل الصلاة بموعد محدد"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 200, 200, 200)
                enableLights(true)
                lightColor = 0xFFD97706.toInt()
            }

            // 3. Salawat Channel
            val salawatSoundUri = Uri.parse("android.resource://" + context.packageName + "/" + R.raw.salawat)
            val salawatChannel = NotificationChannel(
                CHANNEL_SALAWAT,
                "الصلاة على النبي ﷺ",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "قناة التذكير الدوري بالصلاة على النبي ﷺ"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 150, 150, 150)
                enableLights(true)
                lightColor = 0xFF10B981.toInt()
                setSound(salawatSoundUri, audioAttributes)
            }

            // 4. General Channel
            val generalChannel = NotificationChannel(
                CHANNEL_GENERAL,
                "إشعارات عامة وتذكيرات",
                NotificationManager.IMPORTANCE_DEFAULT
            )

            notificationManager.createNotificationChannels(
                listOf(adhanChannel, prepChannel, salawatChannel, generalChannel)
            )
        }
    }

    fun buildAdhanNotification(
        context: Context,
        prayerNameAr: String
    ): NotificationCompat.Builder {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("route", "/prayer/times")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(context, AdhanService::class.java).apply {
            action = AdhanService.ACTION_STOP_ADHAN
        }
        val stopPendingIntent = PendingIntent.getService(
            context,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(context, CHANNEL_ADHAN)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("حان الآن موعد صلاة $prayerNameAr")
            .setContentText("أَثَر — الله أكبر، الله أكبر")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(0, "إيقاف الأذان", stopPendingIntent)
    }

    fun showNotification(
        context: Context,
        notificationId: Int,
        channelId: String,
        title: String,
        body: String,
        route: String = "/prayer/times"
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("route", route)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        if (channelId == CHANNEL_SALAWAT) {
            val salawatSoundUri = Uri.parse("android.resource://" + context.packageName + "/" + R.raw.salawat)
            builder.setSound(salawatSoundUri)
        }

        notificationManager.notify(notificationId, builder.build())
    }
}
