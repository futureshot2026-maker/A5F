package com.a5f.social.ui.feed

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.a5f.social.data.model.Comment

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostDetailScreen(
    onBack: () -> Unit,
    viewModel: CommentsViewModel = hiltViewModel()
) {
    val comments by viewModel.comments.collectAsState()
    var draft by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Comments") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, contentDescription = "Back") } }
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(8.dp),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = draft,
                    onValueChange = { draft = it },
                    placeholder = { Text("Add a comment...") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                IconButton(onClick = {
                    viewModel.addComment(draft)
                    draft = ""
                }) { Icon(Icons.Filled.Send, contentDescription = "Send") }
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
            items(comments, key = { it.id }) { comment -> CommentRow(comment) }
        }
    }
}

@Composable
private fun CommentRow(comment: Comment) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)) {
        Text(comment.authorName.ifBlank { "Someone" }, style = MaterialTheme.typography.labelLarge)
        Text(comment.text, style = MaterialTheme.typography.bodyMedium)
    }
    HorizontalDivider()
}
