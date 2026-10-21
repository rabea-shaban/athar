package com.athar.islamic.prayer

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.athar.islamic.alarm.PrayerAlarmReceiver
import com.batoulapps.adhan.CalculationMethod
import com.batoulapps.adhan.CalculationParameters
import com.batoulapps.adhan.Coordinates
import com.batoulapps.adhan.Madhab
import com.batoulapps.adhan.PrayerTimes
import com.batoulapps.adhan.data.DateComponents
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.Date

object PrayerScheduleManager {
    private const val TAG = "ATHAR_ScheduleManager"
    private const val PREFS_NAME = "athar_prayer_schedules"
    private const val PREFS_PARAMS = "athar_prayer_params"
    private const val KEY_SAVED_SCHEDULES = "saved_schedules_json"
    private const val KEY_SALAWAT_CONFIG = "salawat_config_json"

    fun canScheduleExactAlarms(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.canScheduleExactAlarms()
        } else {
            true
        }
    }

    fun saveCalculationParams(
        context: Context,
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
        val prefs = context.getSharedPreferences(PREFS_PARAMS, Context.MODE_PRIVATE)
        prefs.edit()
            .putFloat("latitude", latitude.toFloat())
            .putFloat("longitude", longitude.toFloat())
            .putString("methodName", methodName)
            .putString("madhabName", madhabName)
            .putInt("prePrayerMinutes", prePrayerMinutes)
            .putString("soundUrl", soundUrl ?: "")
            .putString("fajrSoundUrl", fajrSoundUrl ?: "")
            .putBoolean("fajr", fajr)
            .putBoolean("dhuhr", dhuhr)
            .putBoolean("asr", asr)
            .putBoolean("maghrib", maghrib)
            .putBoolean("isha", isha)
            .apply()
        Log.d(TAG, "[ATHAR][Params] Saved calculation params natively: ($latitude, $longitude), method=$methodName")
    }

    fun scheduleTestAdhanInOneMinute(context: Context, prayerNameAr: String, soundUrl: String? = null) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val triggerTime = System.currentTimeMillis() + 60_000

        val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
            action = PrayerAlarmReceiver.ACTION_ADHAN
            putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_KEY, "test_dhuhr")
            putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_NAME, prayerNameAr)
            if (!soundUrl.isNullOrEmpty()) {
                putExtra(PrayerAlarmReceiver.EXTRA_SOUND_URL, soundUrl)
            }
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            8888,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        setExactAlarm(alarmManager, triggerTime, pendingIntent)
        Log.d(TAG, "[ATHAR][TestSchedule] Scheduled test Adhan in 60 seconds ($triggerTime) soundUrl=$soundUrl")
    }

    fun scheduleAllFromJson(context: Context, jsonString: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_SAVED_SCHEDULES, jsonString).apply()

        try {
            val jsonArray = JSONArray(jsonString)
            val now = System.currentTimeMillis()

            for (i in 0 until jsonArray.length()) {
                val item = jsonArray.getJSONObject(i)
                val prayerKey = item.getString("prayerKey") // e.g. "dhuhr"
                val prayerNameAr = item.getString("prayerNameAr") // e.g. "الظهر"
                val timestamp = item.getLong("timestamp")
                val isPrePrayer = item.optBoolean("isPrePrayer", false)
                val preMinutes = item.optInt("preMinutes", 0)
                val soundUrl = item.optString("soundUrl", "")

                if (timestamp > now) {
                    val requestCode = generateRequestCode(prayerKey, isPrePrayer, timestamp)
                    val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                        action = if (isPrePrayer) PrayerAlarmReceiver.ACTION_PRE_PRAYER else PrayerAlarmReceiver.ACTION_ADHAN
                        putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_KEY, prayerKey)
                        putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_NAME, prayerNameAr)
                        putExtra(PrayerAlarmReceiver.EXTRA_PRE_MINUTES, preMinutes)
                        if (!soundUrl.isNullOrEmpty()) {
                            putExtra(PrayerAlarmReceiver.EXTRA_SOUND_URL, soundUrl)
                        }
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )

                    setExactAlarm(alarmManager, timestamp, pendingIntent)
                }
            }
            Log.d(TAG, "[ATHAR][Schedule] Successfully scheduled alarms from JSON. Count=${jsonArray.length()}")
        } catch (e: Exception) {
            Log.e(TAG, "[ATHAR][Schedule] Failed to parse and schedule prayers: ${e.message}", e)
        }
    }

    private fun getCalculationParameters(methodName: String, madhabName: String): CalculationParameters {
        val methodEnum = when (methodName) {
            "Egyptian" -> CalculationMethod.EGYPTIAN
            "UmmAlQura" -> CalculationMethod.UMM_AL_QURA
            "MuslimWorldLeague" -> CalculationMethod.MUSLIM_WORLD_LEAGUE
            "NorthAmerica" -> CalculationMethod.NORTH_AMERICA
            "Dubai" -> CalculationMethod.DUBAI
            "Qatar" -> CalculationMethod.QATAR
            "Kuwait" -> CalculationMethod.KUWAIT
            "Karachi" -> CalculationMethod.KARACHI
            "Singapore" -> CalculationMethod.SINGAPORE
            else -> CalculationMethod.EGYPTIAN
        }

        val params = methodEnum.parameters
        params.madhab = if (madhabName.equals("hanafi", ignoreCase = true)) {
            Madhab.HANAFI
        } else {
            Madhab.SHAFI
        }

        return params
    }

    /**
     * Recalculate and schedule the next 7 days natively in Kotlin using adhan-java library
     */
    fun recalculateAndScheduleNextDays(context: Context, daysCount: Int = 7) {
        val paramsPrefs = context.getSharedPreferences(PREFS_PARAMS, Context.MODE_PRIVATE)

        if (!paramsPrefs.contains("latitude") || !paramsPrefs.contains("longitude")) {
            Log.w(TAG, "[ATHAR][AutoRenew] No native calculation params stored. Skipping native recalculation.")
            return
        }

        val latitude = paramsPrefs.getFloat("latitude", 0f).toDouble()
        val longitude = paramsPrefs.getFloat("longitude", 0f).toDouble()
        val methodName = paramsPrefs.getString("methodName", "Egyptian") ?: "Egyptian"
        val madhabName = paramsPrefs.getString("madhabName", "shafi") ?: "shafi"
        val prePrayerMinutes = paramsPrefs.getInt("prePrayerMinutes", 15)
        val soundUrl = paramsPrefs.getString("soundUrl", "") ?: ""
        val fajrSoundUrl = paramsPrefs.getString("fajrSoundUrl", "") ?: ""

        val fajrEnabled = paramsPrefs.getBoolean("fajr", true)
        val dhuhrEnabled = paramsPrefs.getBoolean("dhuhr", true)
        val asrEnabled = paramsPrefs.getBoolean("asr", true)
        val maghribEnabled = paramsPrefs.getBoolean("maghrib", true)
        val ishaEnabled = paramsPrefs.getBoolean("isha", true)

        if (latitude == 0.0 && longitude == 0.0) {
            Log.w(TAG, "[ATHAR][AutoRenew] Invalid coordinates (0,0). Skipping auto-renewal.")
            return
        }

        Log.d(TAG, "[ATHAR][AutoRenew] Recalculating next $daysCount days for ($latitude, $longitude) method=$methodName...")

        try {
            val coordinates = Coordinates(latitude, longitude)
            val calculationParams = getCalculationParameters(methodName, madhabName)
            val jsonArray = JSONArray()
            val now = System.currentTimeMillis()

            val calendar = Calendar.getInstance()

            data class PrayerItem(val key: String, val nameAr: String, val timeDate: Date?)

            for (dayIdx in 0 until daysCount) {
                val dateComponents = DateComponents.from(calendar.time)
                val prayerTimes = PrayerTimes(coordinates, dateComponents, calculationParams)

                val prayers = listOf(
                    PrayerItem("fajr", "الفجر", prayerTimes.fajr),
                    PrayerItem("dhuhr", "الظهر", prayerTimes.dhuhr),
                    PrayerItem("asr", "العصر", prayerTimes.asr),
                    PrayerItem("maghrib", "المغرب", prayerTimes.maghrib),
                    PrayerItem("isha", "العشاء", prayerTimes.isha)
                )

                for (p in prayers) {
                    val enabled = when (p.key) {
                        "fajr" -> fajrEnabled
                        "dhuhr" -> dhuhrEnabled
                        "asr" -> asrEnabled
                        "maghrib" -> maghribEnabled
                        "isha" -> ishaEnabled
                        else -> true
                    }

                    if (!enabled || p.timeDate == null) continue

                    val chosenSound = if (p.key == "fajr" && fajrSoundUrl.isNotEmpty()) fajrSoundUrl else soundUrl
                    val timestamp = p.timeDate.time

                    if (timestamp > now) {
                        val itemObj = JSONObject().apply {
                            put("prayerKey", p.key)
                            put("prayerNameAr", p.nameAr)
                            put("timestamp", timestamp)
                            put("isPrePrayer", false)
                            put("preMinutes", 0)
                            put("soundUrl", chosenSound)
                        }
                        jsonArray.put(itemObj)

                        if (prePrayerMinutes > 0) {
                            val preTimestamp = timestamp - (prePrayerMinutes * 60 * 1000L)
                            if (preTimestamp > now) {
                                val preItemObj = JSONObject().apply {
                                    put("prayerKey", p.key)
                                    put("prayerNameAr", p.nameAr)
                                    put("timestamp", preTimestamp)
                                    put("isPrePrayer", true)
                                    put("preMinutes", prePrayerMinutes)
                                    put("soundUrl", chosenSound)
                                }
                                jsonArray.put(preItemObj)
                            }
                        }
                    }
                }

                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }

            if (jsonArray.length() > 0) {
                scheduleAllFromJson(context, jsonArray.toString())
                Log.d(TAG, "[ATHAR][AutoRenew] Successfully auto-renewed ${jsonArray.length()} prayer alarms!")
            }
        } catch (e: Exception) {
            Log.e(TAG, "[ATHAR][AutoRenew] Error recalculating prayer times natively: ${e.message}", e)
        }
    }

    /**
     * Check if remaining scheduled future alarms count is low (<= 10), and auto-renew next 7 days
     */
    fun checkAndAutoRenewSchedulesIfNeeded(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedJson = prefs.getString(KEY_SAVED_SCHEDULES, null)
        val now = System.currentTimeMillis()

        var remainingFutureCount = 0

        if (!savedJson.isNullOrEmpty()) {
            try {
                val jsonArray = JSONArray(savedJson)
                for (i in 0 until jsonArray.length()) {
                    val item = jsonArray.getJSONObject(i)
                    if (item.getLong("timestamp") > now) {
                        remainingFutureCount++
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "[ATHAR][AutoRenew] Error parsing saved schedules: ${e.message}")
            }
        }

        Log.d(TAG, "[ATHAR][AutoRenew] Remaining future prayer alarms count: $remainingFutureCount")

        // If remaining alarms drop below 10 (less than 2 days of prayers left), auto-renew!
        if (remainingFutureCount <= 10) {
            recalculateAndScheduleNextDays(context, 7)
        }
    }

    fun scheduleSalawatReminders(
        context: Context,
        enabled: Boolean,
        intervalHours: Double,
        startHour: Int,
        endHour: Int
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val configJson = JSONObject().apply {
            put("enabled", enabled)
            put("intervalHours", intervalHours)
            put("startHour", startHour)
            put("endHour", endHour)
        }
        prefs.edit().putString(KEY_SALAWAT_CONFIG, configJson.toString()).apply()

        cancelSalawatAlarms(context)

        if (!enabled) return

        val now = Calendar.getInstance()
        val intervalMinutes = Math.max(15, (intervalHours * 60).toInt())

        val startCal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, startHour)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val endCal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, endHour)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        var reqIndex = 0
        val currCal = startCal.clone() as Calendar

        while (currCal.get(Calendar.HOUR_OF_DAY) <= endHour && currCal.timeInMillis <= endCal.timeInMillis) {
            val alarmTime = currCal.clone() as Calendar
            if (alarmTime.timeInMillis <= now.timeInMillis) {
                alarmTime.add(Calendar.DAY_OF_YEAR, 1)
            }

            val requestCode = 9000 + reqIndex
            val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                action = PrayerAlarmReceiver.ACTION_SALAWAT
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            setExactAlarm(alarmManager, alarmTime.timeInMillis, pendingIntent)

            currCal.add(Calendar.MINUTE, intervalMinutes)
            reqIndex++
            if (reqIndex > 50) break
        }
    }

    private fun setExactAlarm(alarmManager: AlarmManager, triggerAtMillis: Long, pendingIntent: PendingIntent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            }
        } catch (se: SecurityException) {
            Log.w(TAG, "[ATHAR][Schedule] SecurityException setting exact alarm (permission revoked). Falling back to setAndAllowWhileIdle: ${se.message}")
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                }
            } catch (e: Exception) {
                Log.e(TAG, "[ATHAR][Schedule] Fallback alarm scheduling error: ${e.message}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "[ATHAR][Schedule] General error setting exact alarm: ${e.message}")
        }
    }

    fun cancelAllSchedules(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedJson = prefs.getString(KEY_SAVED_SCHEDULES, null)

        if (!savedJson.isNullOrEmpty()) {
            try {
                val jsonArray = JSONArray(savedJson)
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

                for (i in 0 until jsonArray.length()) {
                    val item = jsonArray.getJSONObject(i)
                    val prayerKey = item.getString("prayerKey")
                    val isPrePrayer = item.optBoolean("isPrePrayer", false)
                    val timestamp = item.getLong("timestamp")

                    val requestCode = generateRequestCode(prayerKey, isPrePrayer, timestamp)
                    val intent = Intent(context, PrayerAlarmReceiver::class.java)
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
                    )
                    pendingIntent?.let {
                        alarmManager.cancel(it)
                        it.cancel()
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "[ATHAR][Schedule] Error cancelling schedules: ${e.message}")
            }
        }

        cancelSalawatAlarms(context)
        prefs.edit().remove(KEY_SAVED_SCHEDULES).apply()
    }

    private fun cancelSalawatAlarms(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        for (i in 0..50) {
            val requestCode = 9000 + i
            val intent = Intent(context, PrayerAlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            pendingIntent?.let {
                alarmManager.cancel(it)
                it.cancel()
            }
        }
    }

    private fun generateRequestCode(prayerKey: String, isPrePrayer: Boolean, timestamp: Long): Int {
        val base = when (prayerKey.lowercase()) {
            "fajr" -> 1000
            "sunrise" -> 2000
            "dhuhr" -> 3000
            "asr" -> 4000
            "maghrib" -> 5000
            "isha" -> 6000
            else -> 7000
        }
        val preOffset = if (isPrePrayer) 500 else 0
        val dayOffset = (timestamp / 86400000 % 100).toInt()
        return base + preOffset + dayOffset
    }

    fun restoreSchedulesOnBoot(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedSchedules = prefs.getString(KEY_SAVED_SCHEDULES, null)
        val salawatConfigStr = prefs.getString(KEY_SALAWAT_CONFIG, null)

        Log.d(TAG, "[ATHAR][Boot] Restoring schedules on device boot/timezone change...")

        if (!savedSchedules.isNullOrEmpty()) {
            scheduleAllFromJson(context, savedSchedules)
        }

        checkAndAutoRenewSchedulesIfNeeded(context)

        if (!salawatConfigStr.isNullOrEmpty()) {
            try {
                val salawatObj = JSONObject(salawatConfigStr)
                if (salawatObj.optBoolean("enabled", false)) {
                    scheduleSalawatReminders(
                        context,
                        true,
                        salawatObj.optDouble("intervalHours", 1.0),
                        salawatObj.optInt("startHour", 8),
                        salawatObj.optInt("endHour", 22)
                    )
                }
            } catch (e: Exception) {
                Log.w(TAG, "[ATHAR][Boot] Failed to restore Salawat config: ${e.message}")
            }
        }
    }
}
