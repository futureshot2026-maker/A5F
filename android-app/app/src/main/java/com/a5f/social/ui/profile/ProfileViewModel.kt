package com.a5f.social.ui.profile

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.a5f.social.data.model.UserProfile
import com.a5f.social.data.repository.AuthRepository
import com.a5f.social.data.repository.MediaRepository
import com.a5f.social.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val userRepository: UserRepository,
    private val mediaRepository: MediaRepository
) : ViewModel() {

    private val uid get() = authRepository.currentUser?.uid.orEmpty()

    val profile: StateFlow<UserProfile?> = userRepository.observeProfile(uid)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    fun signOut() = authRepository.signOut()

    fun updateProfile(displayName: String, bio: String, newPhoto: Uri?) {
        viewModelScope.launch {
            val photoUrl = newPhoto?.let { mediaRepository.uploadImage(it, "avatars").getOrNull() }
            userRepository.updateProfile(uid, displayName, bio, photoUrl)
        }
    }
}
