package com.a5f.social.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.a5f.social.data.repository.AuthRepository
import com.a5f.social.data.repository.UserRepository
import com.google.firebase.auth.FirebaseUser
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    val currentUser: StateFlow<FirebaseUser?> = authRepository.authState()
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, authRepository.currentUser)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun signUp(displayName: String, username: String, email: String, password: String) {
        _uiState.value = AuthUiState(isLoading = true)
        viewModelScope.launch {
            authRepository.signUp(email, password)
                .onSuccess { user ->
                    userRepository.createProfileIfMissing(user.uid, displayName, username)
                    _uiState.value = AuthUiState()
                }
                .onFailure { _uiState.value = AuthUiState(errorMessage = it.message) }
        }
    }

    fun signIn(email: String, password: String) {
        _uiState.value = AuthUiState(isLoading = true)
        viewModelScope.launch {
            authRepository.signIn(email, password)
                .onSuccess { _uiState.value = AuthUiState() }
                .onFailure { _uiState.value = AuthUiState(errorMessage = it.message) }
        }
    }

    fun sendPasswordReset(email: String) {
        viewModelScope.launch { authRepository.sendPasswordReset(email) }
    }

    fun signOut() = authRepository.signOut()
}
