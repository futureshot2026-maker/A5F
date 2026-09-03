package com.a5f.social.ui.profile

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
fun EditProfileScreen(
    onDone: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val profile by viewModel.profile.collectAsState()
    var displayName by remember(profile) { mutableStateOf(profile?.displayName.orEmpty()) }
    var bio by remember(profile) { mutableStateOf(profile?.bio.orEmpty()) }
    var newPhoto by remember { mutableStateOf<Uri?>(null) }

    val pickImage = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        newPhoto = uri
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit profile") },
                navigationIcon = { IconButton(onClick = onDone) { Icon(Icons.Filled.ArrowBack, contentDescription = "Back") } }
            )
        }
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AsyncImage(
                model = newPhoto ?: profile?.photoUrl?.ifBlank { null },
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(96.dp).clip(CircleShape)
            )
            TextButton(onClick = { pickImage.launch("image/*") }) { Text("Change photo") }

            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = displayName, onValueChange = { displayName = it },
                label = { Text("Display name") }, modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = bio, onValueChange = { bio = it },
                label = { Text("Bio") }, modifier = Modifier.fillMaxWidth(), minLines = 3
            )

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = {
                    viewModel.updateProfile(displayName.trim(), bio.trim(), newPhoto)
                    onDone()
                },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Save") }
        }
    }
}
