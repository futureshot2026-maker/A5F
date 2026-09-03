package com.a5f.social.ui.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.a5f.social.data.model.Chat
import com.a5f.social.data.repository.AuthRepository
import com.a5f.social.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class ChatListViewModel @Inject constructor(
    authRepository: AuthRepository,
    chatRepository: ChatRepository
) : ViewModel() {

    val currentUid: String = authRepository.currentUser?.uid.orEmpty()

    val chats: StateFlow<List<Chat>> = chatRepository.observeChats(currentUid)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
