package com.a5f.social.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onEditProfile: () -> Unit,
    onSignedOut: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val profile by viewModel.profile.collectAsState()

    Scaffold(topBar = { TopAppBar(title = { Text("Profile") }) }) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AsyncImage(
                model = profile?.photoUrl?.ifBlank { null },
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(96.dp).clip(CircleShape)
            )
            Spacer(Modifier.height(12.dp))
            Text(profile?.displayName.orEmpty(), style = MaterialTheme.typography.titleLarge)
            Text("@${profile?.username.orEmpty()}", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(8.dp))
            Text(profile?.bio.orEmpty(), style = MaterialTheme.typography.bodyMedium)

            Spacer(Modifier.height(16.dp))
            Row {
                Text("${profile?.followerCount ?: 0} followers")
                Spacer(Modifier.width(16.dp))
                Text("${profile?.followingCount ?: 0} following")
            }

            Spacer(Modifier.height(24.dp))
            Button(onClick = onEditProfile, modifier = Modifier.fillMaxWidth()) { Text("Edit profile") }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                onClick = {
                    viewModel.signOut()
                    onSignedOut()
                },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Log out") }
        }
    }
}
