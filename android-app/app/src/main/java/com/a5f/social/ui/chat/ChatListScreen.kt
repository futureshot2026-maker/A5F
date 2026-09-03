package com.a5f.social.ui.chat

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.a5f.social.data.model.Chat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatListScreen(
    onOpenChat: (String) -> Unit,
    viewModel: ChatListViewModel = hiltViewModel()
) {
    val chats by viewModel.chats.collectAsState()

    Scaffold(topBar = { TopAppBar(title = { Text("Messages") }) }) { padding ->
        if (chats.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No conversations yet")
            }
        } else {
            LazyColumn(Modifier.fillMaxSize().padding(padding)) {
                items(chats, key = { it.id }) { chat ->
                    val otherUid = chat.participantIds.firstOrNull { it != viewModel.currentUid }
                    val name = otherUid?.let { chat.participantNames[it] } ?: "Conversation"
                    val photo = otherUid?.let { chat.participantPhotos[it] }.orEmpty()

                    Row(
                        Modifier.fillMaxWidth().clickable { onOpenChat(chat.id) }.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AsyncImage(
                            model = photo.ifBlank { null },
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.size(48.dp).clip(CircleShape)
                        )
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(name, style = MaterialTheme.typography.titleMedium)
                            Text(
                                chat.lastMessage.ifBlank { "Say hello 👋" },
                                style = MaterialTheme.typography.bodyMedium,
                                maxLines = 1
                            )
                        }
                    }
                    HorizontalDivider()
                }
            }
        }
    }
}
