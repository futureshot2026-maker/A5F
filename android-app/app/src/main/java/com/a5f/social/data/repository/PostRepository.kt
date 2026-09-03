package com.a5f.social.data.repository

import com.a5f.social.data.model.Comment
import com.a5f.social.data.model.Post
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PostRepository @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    private fun postsCollection() = firestore.collection("posts")

    /** Realtime activity feed, newest first. */
    fun observeFeed(currentUid: String, limit: Long = 50): Flow<List<Post>> = callbackFlow {
        val registration = postsCollection()
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(limit)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val posts = snapshot?.toObjects(Post::class.java).orEmpty()
                trySend(posts)
            }
        awaitClose { registration.remove() }
    }

    suspend fun createPost(authorId: String, authorName: String, authorPhotoUrl: String, text: String, mediaUrl: String?) {
        val post = Post(
            authorId = authorId,
            authorName = authorName,
            authorPhotoUrl = authorPhotoUrl,
            text = text,
            mediaUrl = mediaUrl.orEmpty()
        )
        postsCollection().add(post).await()
    }

    suspend fun setLiked(postId: String, uid: String, liked: Boolean) {
        val postRef = postsCollection().document(postId)
        val likeRef = postRef.collection("likes").document(uid)
        firestore.runTransaction { tx ->
            val likeSnap = tx.get(likeRef)
            if (liked && !likeSnap.exists()) {
                tx.set(likeRef, mapOf("createdAt" to FieldValue.serverTimestamp()))
                tx.update(postRef, "likeCount", FieldValue.increment(1))
            } else if (!liked && likeSnap.exists()) {
                tx.delete(likeRef)
                tx.update(postRef, "likeCount", FieldValue.increment(-1))
            }
        }.await()
    }

    suspend fun isLikedByCurrentUser(postId: String, uid: String): Boolean =
        postsCollection().document(postId).collection("likes").document(uid).get().await().exists()

    fun observeComments(postId: String): Flow<List<Comment>> = callbackFlow {
        val registration = postsCollection().document(postId).collection("comments")
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                trySend(snapshot?.toObjects(Comment::class.java).orEmpty())
            }
        awaitClose { registration.remove() }
    }

    suspend fun addComment(postId: String, authorId: String, authorName: String, authorPhotoUrl: String, text: String) {
        val postRef = postsCollection().document(postId)
        val comment = Comment(
            authorId = authorId,
            authorName = authorName,
            authorPhotoUrl = authorPhotoUrl,
            text = text
        )
        firestore.runBatch { batch ->
            batch.set(postRef.collection("comments").document(), comment)
            batch.update(postRef, "commentCount", FieldValue.increment(1))
        }.await()
    }
}
