package com.a5f.social.ui.feed

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreatePostScreen(
    onDone: () -> Unit,
    viewModel: FeedViewModel = hiltViewModel()
) {
    var text by remember { mutableStateOf("") }
    var imageUri by remember { mutableStateOf<Uri?>(null) }

    val pickImage = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        imageUri = uri
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New post") },
                navigationIcon = {
                    IconButton(onClick = onDone) { Icon(Icons.Filled.ArrowBack, contentDescription = "Back") }
                }
            )
        }
    ) { padding ->
        Column(Modifier.padding(padding).padding(16.dp).fillMaxSize()) {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                placeholder = { Text("What's on your mind?") },
                modifier = Modifier.fillMaxWidth().weight(1f, fill = false).heightIn(min = 120.dp)
            )
            Spacer(Modifier.height(12.dp))

            imageUri?.let {
                Image(
                    painter = rememberAsyncImagePainter(it),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().height(200.dp)
                )
                Spacer(Modifier.height(12.dp))
            }

            OutlinedButton(onClick = { pickImage.launch("image/*") }) {
                Icon(Icons.Filled.AddPhotoAlternate, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(if (imageUri == null) "Add photo" else "Change photo")
            }

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = {
                    viewModel.createPost(text.trim(), imageUri)
                    onDone()
                },
                enabled = text.isNotBlank(),
                modifier = Modifier.fillMaxWidth()
            ) { Text("Share") }
        }
    }
}
