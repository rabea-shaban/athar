# Project specific ProGuard rules for ATHAR (React Native / Expo)

# React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.fresco.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactProp *;
    @com.facebook.react.bridge.ReactPropGroup *;
}

# Expo Modules & Plugins
-keep class expo.modules.** { *; }
-keep class expo.modules.core.** { *; }
-keep class expo.modules.audio.** { *; }
-keep class expo.modules.notifications.** { *; }
-keep class expo.modules.filesystem.** { *; }
-keep class expo.modules.constants.** { *; }

# React Native Reanimated & Screens
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# React Native SVG & Async Storage
-keep class com.horcrux.svg.** { *; }
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Kotlin & Coroutines
-keepclassmembers class * {
    @kotlin.jvm.JvmField <fields>;
}
-keep class kotlinx.coroutines.** { *; }

# OkHttp & Okio
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# General ProGuard Warnings Suppressions
-dontwarn com.facebook.react.**
-dontwarn expo.modules.**
-dontwarn javax.annotation.**
