# Add project specific ProGuard rules here.
# Firebase / Firestore model classes are (de)serialized via reflection - keep fields.
-keepattributes Signature
-keepattributes *Annotation*
-keepclassmembers class com.a5f.social.data.model.** {
  *;
}
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
