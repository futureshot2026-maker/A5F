package com.a5f.social.data.repository

import com.a5f.social.data.model.UserProfile
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserRepository @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    private fun usersCollection() = firestore.collection("users")

    suspend fun createProfileIfMissing(uid: String, displayName: String, username: String) {
        val doc = usersCollection().document(uid)
        val snapshot = doc.get().await()
        if (!snapshot.exists()) {
            doc.set(
                UserProfile(
                    uid = uid,
                    displayName = displayName,
                    username = username
                )
            ).await()
        }
    }

    fun observeProfile(uid: String): Flow<UserProfile?> = callbackFlow {
        val registration = usersCollection().document(uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                trySend(snapshot?.toObject(UserProfile::class.java))
            }
        awaitClose { registration.remove() }
    }

    suspend fun getProfile(uid: String): UserProfile? =
        usersCollection().document(uid).get().await().toObject(UserProfile::class.java)

    suspend fun updateProfile(uid: String, displayName: String, bio: String, photoUrl: String?) {
        val updates = mutableMapOf<String, Any>(
            "displayName" to displayName,
            "bio" to bio
        )
        if (!photoUrl.isNullOrBlank()) updates["photoUrl"] = photoUrl
        usersCollection().document(uid).set(updates, com.google.firebase.firestore.SetOptions.merge()).await()
    }

    suspend fun registerFcmToken(uid: String, token: String) {
        usersCollection().document(uid)
            .update("fcmTokens", FieldValue.arrayUnion(token))
            .await()
    }
}
