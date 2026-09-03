package com.a5f.social.di

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.storage.FirebaseStorage
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Provides singleton Firebase SDK instances to the rest of the app via Hilt.
 * Swapping the backend later (e.g. a custom REST API) means changing this
 * module and the repository implementations only - the UI layer never
 * touches Firebase directly.
 */
@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance().apply {
        firestoreSettings = firestoreSettings.toBuilder()
            .setLocalCacheSettings(
                com.google.firebase.firestore.PersistentCacheSettings.newBuilder().build()
            )
            .build()
    }

    @Provides
    @Singleton
    fun provideStorage(): FirebaseStorage = FirebaseStorage.getInstance()

    @Provides
    @Singleton
    fun provideMessaging(): FirebaseMessaging = FirebaseMessaging.getInstance()
}
