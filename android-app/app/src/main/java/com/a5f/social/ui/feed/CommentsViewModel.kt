package com.a5f.social.ui.feed

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.a5f.social.data.model.Comment
import com.a5f.social.data.repository.AuthRepository
import com.a5f.social.data.repository.PostRepository
import com.a5f.social.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CommentsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val postRepository: PostRepository,
    private val userRepository: UserRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    val postId: String = checkNotNull(savedStateHandle["postId"])

    val comments: StateFlow<List<Comment>> = postRepository.observeComments(postId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addComment(text: String) {
        val uid = authRepository.currentUser?.uid ?: return
        if (text.isBlank()) return
        viewModelScope.launch {
            val profile = userRepository.getProfile(uid)
            postRepository.addComment(
                postId = postId,
                authorId = uid,
                authorName = profile?.displayName.orEmpty(),
                authorPhotoUrl = profile?.photoUrl.orEmpty(),
                text = text.trim()
            )
        }
    }
}
