package com.a5f.social.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

/** Firestore: users/{uid} */
data class UserProfile(
    @DocumentId val uid: String = "",
    val displayName: String = "",
    val username: String = "",
    val bio: String = "",
    val photoUrl: String = "",
    @ServerTimestamp val createdAt: Date? = null,
    val followerCount: Long = 0,
    val followingCount: Long = 0,
    val fcmTokens: List<String> = emptyList()
)

/** Firestore: posts/{postId} */
data class Post(
    @DocumentId val id: String = "",
    val authorId: String = "",
    val authorName: String = "",
    val authorPhotoUrl: String = "",
    val text: String = "",
    val mediaUrl: String = "",
    @ServerTimestamp val createdAt: Date? = null,
    val likeCount: Long = 0,
    val commentCount: Long = 0,
    @get:PropertyName("liked") @set:PropertyName("liked")
    var liked: Boolean = false // client-side only, not persisted on the post doc itself
)

/** Firestore: posts/{postId}/likes/{uid} - existence of the doc means "liked" */
data class Like(
    @ServerTimestamp val createdAt: Date? = null
)

/** Firestore: posts/{postId}/comments/{commentId} */
data class Comment(
    @DocumentId val id: String = "",
    val authorId: String = "",
    val authorName: String = "",
    val authorPhotoUrl: String = "",
    val text: String = "",
    @ServerTimestamp val createdAt: Date? = null
)

/** Firestore: chats/{chatId} - one doc per 1:1 (or group) conversation */
data class Chat(
    @DocumentId val id: String = "",
    val participantIds: List<String> = emptyList(),
    val participantNames: Map<String, String> = emptyMap(),
    val participantPhotos: Map<String, String> = emptyMap(),
    val lastMessage: String = "",
    @ServerTimestamp val lastMessageAt: Date? = null,
    val lastMessageSenderId: String = ""
)

/** Firestore: chats/{chatId}/messages/{messageId} */
data class ChatMessage(
    @DocumentId val id: String = "",
    val senderId: String = "",
    val text: String = "",
    val mediaUrl: String = "",
    @ServerTimestamp val createdAt: Date? = null
)
