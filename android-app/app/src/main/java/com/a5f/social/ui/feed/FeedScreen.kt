package com.a5f.social.ui.feed

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.a5f.social.data.model.Post

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(
    onOpenPost: (String) -> Unit,
    onCreatePost: () -> Unit,
    viewModel: FeedViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = { TopAppBar(title = { Text("A5F Social") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = onCreatePost) { Icon(Icons.Filled.Add, contentDescription = "New post") }
        }
    ) { padding ->
        if (uiState.posts.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = androidx.compose.ui.Alignment.Center) {
                Text("No posts yet. Be the first to share something!")
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                items(uiState.posts, key = { it.id }) { post ->
                    PostCard(
                        post = post,
                        onOpen = { onOpenPost(post.id) },
                        onLikeToggled = { liked -> viewModel.toggleLike(post.id, liked) },
                        checkLiked = { viewModel.isLikedByMe(post.id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun PostCard(
    post: Post,
    onOpen: () -> Unit,
    onLikeToggled: (Boolean) -> Unit,
    checkLiked: suspend () -> Boolean
) {
    var liked by remember(post.id) { mutableStateOf(false) }
    LaunchedEffect(post.id) { liked = checkLiked() }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .clickable(onClick = onOpen)
    ) {
        Column(Modifier.padding(12.dp)) {
            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                AsyncImage(
                    model = post.authorPhotoUrl.ifBlank { null },
                    contentDescription = null,
                    modifier = Modifier.size(36.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(Modifier.width(8.dp))
                Text(post.authorName.ifBlank { "Someone" }, style = MaterialTheme.typography.titleMedium)
            }
            Spacer(Modifier.height(8.dp))
            Text(post.text, style = MaterialTheme.typography.bodyLarge)

            if (post.mediaUrl.isNotBlank()) {
                Spacer(Modifier.height(8.dp))
                AsyncImage(
                    model = post.mediaUrl,
                    contentDescription = null,
                    modifier = Modifier.fillMaxWidth().heightIn(max = 320.dp).clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                IconButton(onClick = {
                    val wasLiked = liked
                    liked = !wasLiked
                    onLikeToggled(wasLiked)
                }) {
                    Icon(
                        if (liked) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = "Like",
                        tint = if (liked) MaterialTheme.colorScheme.error else LocalContentColor.current
                    )
                }
                Text("${post.likeCount}")
                Spacer(Modifier.width(16.dp))
                Icon(Icons.Filled.ChatBubbleOutline, contentDescription = "Comments")
                Spacer(Modifier.width(4.dp))
                Text("${post.commentCount}")
            }
        }
    }
}
