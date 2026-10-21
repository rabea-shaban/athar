package com.athar.islamic.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.athar.islamic.prayer.PrayerScheduleManager

class BootReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "ATHAR_BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "[ATHAR][Boot] Broadcast received: $action")

        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            PrayerScheduleManager.restoreSchedulesOnBoot(context)
        }
    }
}
