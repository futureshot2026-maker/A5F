package com.a5f.social.data.repository

import android.net.Uri
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MediaRepository @Inject constructor(
    private val storage: FirebaseStorage
) {
    /** Uploads an image (post media or avatar) and returns its public download URL. */
    suspend fun uploadImage(uri: Uri, folder: String): Result<String> = runCatching {
        val ref = storage.reference.child("$folder/${UUID.randomUUID()}.jpg")
        ref.putFile(uri).await()
        ref.downloadUrl.await().toString()
    }
}
