package com.a5f.social.ui.feed

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.a5f.social.data.model.Post
import com.a5f.social.data.repository.AuthRepository
import com.a5f.social.data.repository.MediaRepository
import com.a5f.social.data.repository.PostRepository
import com.a5f.social.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class FeedUiState(
    val posts: List<Post> = emptyList(),
    val isPosting: Boolean = false
)

@HiltViewModel
class FeedViewModel @Inject constructor(
    private val postRepository: PostRepository,
    private val userRepository: UserRepository,
    private val mediaRepository: MediaRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val uid get() = authRepository.currentUser?.uid.orEmpty()

    val uiState: StateFlow<FeedUiState> = postRepository.observeFeed(uid)
        .map { posts -> FeedUiState(posts = posts) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), FeedUiState())

    fun createPost(text: String, imageUri: Uri?) {
        val currentUid = uid
        if (currentUid.isBlank() || text.isBlank()) return
        viewModelScope.launch {
            val profile = userRepository.getProfile(currentUid)
            val mediaUrl = imageUri?.let { mediaRepository.uploadImage(it, "posts").getOrNull() }
            postRepository.createPost(
                authorId = currentUid,
                authorName = profile?.displayName.orEmpty(),
                authorPhotoUrl = profile?.photoUrl.orEmpty(),
                text = text,
                mediaUrl = mediaUrl
            )
        }
    }

    /** The feed listener doesn't know per-user like state; the UI checks it lazily per card. */
    suspend fun isLikedByMe(postId: String): Boolean {
        val currentUid = uid
        return currentUid.isNotBlank() && postRepository.isLikedByCurrentUser(postId, currentUid)
    }

    fun toggleLike(postId: String, currentlyLiked: Boolean) {
        val currentUid = uid
        if (currentUid.isBlank()) return
        viewModelScope.launch {
            postRepository.setLiked(postId, currentUid, !currentlyLiked)
        }
    }
}
