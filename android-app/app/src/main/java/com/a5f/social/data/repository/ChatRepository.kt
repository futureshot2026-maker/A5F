package com.a5f.social.data.repository

import com.a5f.social.data.model.Chat
import com.a5f.social.data.model.ChatMessage
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    private fun chatsCollection() = firestore.collection("chats")

    fun observeChats(uid: String): Flow<List<Chat>> = callbackFlow {
        val registration = chatsCollection()
            .whereArrayContains("participantIds", uid)
            .orderBy("lastMessageAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                trySend(snapshot?.toObjects(Chat::class.java).orEmpty())
            }
        awaitClose { registration.remove() }
    }

    /** Finds an existing 1:1 chat between the two users, or creates one. Returns the chat id. */
    suspend fun getOrCreateDirectChat(
        myUid: String,
        myName: String,
        myPhoto: String,
        otherUid: String,
        otherName: String,
        otherPhoto: String
    ): String {
        val existing = chatsCollection()
            .whereArrayContains("participantIds", myUid)
            .get().await()
            .documents
            .firstOrNull { doc ->
                val ids = doc.get("participantIds") as? List<*>
                ids?.size == 2 && ids.contains(otherUid)
            }
        if (existing != null) return existing.id

        val chat = Chat(
            participantIds = listOf(myUid, otherUid),
            participantNames = mapOf(myUid to myName, otherUid to otherName),
            participantPhotos = mapOf(myUid to myPhoto, otherUid to otherPhoto)
        )
        return chatsCollection().add(chat).await().id
    }

    fun observeMessages(chatId: String): Flow<List<ChatMessage>> = callbackFlow {
        val registration = chatsCollection().document(chatId).collection("messages")
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                trySend(snapshot?.toObjects(ChatMessage::class.java).orEmpty())
            }
        awaitClose { registration.remove() }
    }

    suspend fun sendMessage(chatId: String, senderId: String, text: String, mediaUrl: String? = null) {
        val chatRef = chatsCollection().document(chatId)
        val message = ChatMessage(senderId = senderId, text = text, mediaUrl = mediaUrl.orEmpty())
        firestore.runBatch { batch ->
            batch.set(chatRef.collection("messages").document(), message)
            batch.update(
                chatRef,
                mapOf(
                    "lastMessage" to text.ifBlank { "📷 Photo" },
                    "lastMessageAt" to com.google.firebase.firestore.FieldValue.serverTimestamp(),
                    "lastMessageSenderId" to senderId
                )
            )
        }.await()
    }
}
