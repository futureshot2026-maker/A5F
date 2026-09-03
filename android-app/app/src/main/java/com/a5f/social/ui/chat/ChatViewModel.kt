package com.a5f.social.ui.chat

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.a5f.social.data.model.ChatMessage
import com.a5f.social.data.repository.AuthRepository
import com.a5f.social.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val chatRepository: ChatRepository,
    authRepository: AuthRepository
) : ViewModel() {

    val chatId: String = checkNotNull(savedStateHandle["chatId"])
    val currentUid: String = authRepository.currentUser?.uid.orEmpty()

    val messages: StateFlow<List<ChatMessage>> = chatRepository.observeMessages(chatId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        viewModelScope.launch {
            chatRepository.sendMessage(chatId, currentUid, text.trim())
        }
    }
}
