package com.a5f.social.ui.nav

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.a5f.social.ui.auth.AuthViewModel
import com.a5f.social.ui.auth.LoginScreen
import com.a5f.social.ui.auth.SignUpScreen
import com.a5f.social.ui.chat.ChatListScreen
import com.a5f.social.ui.chat.ChatScreen
import com.a5f.social.ui.feed.CreatePostScreen
import com.a5f.social.ui.feed.FeedScreen
import com.a5f.social.ui.feed.PostDetailScreen
import com.a5f.social.ui.profile.EditProfileScreen
import com.a5f.social.ui.profile.ProfileScreen

private object Routes {
    const val LOGIN = "login"
    const val SIGN_UP = "signup"
    const val MAIN = "main"
    const val FEED = "feed"
    const val CREATE_POST = "create_post"
    const val POST_DETAIL = "post/{postId}"
    const val CHATS = "chats"
    const val CHAT = "chat/{chatId}"
    const val PROFILE = "profile"
    const val EDIT_PROFILE = "edit_profile"

    fun postDetail(postId: String) = "post/$postId"
    fun chat(chatId: String) = "chat/$chatId"
}

private data class BottomTab(val route: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

private val bottomTabs = listOf(
    BottomTab(Routes.FEED, "Feed", Icons.Filled.Home),
    BottomTab(Routes.CHATS, "Messages", Icons.Filled.ChatBubble),
    BottomTab(Routes.PROFILE, "Profile", Icons.Filled.Person)
)

@Composable
fun A5FNavGraph() {
    val rootNavController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()
    val currentUser by authViewModel.currentUser.collectAsState()

    NavHost(
        navController = rootNavController,
        startDestination = if (currentUser != null) Routes.MAIN else Routes.LOGIN
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(onNavigateToSignUp = { rootNavController.navigate(Routes.SIGN_UP) })
        }
        composable(Routes.SIGN_UP) {
            SignUpScreen(onNavigateToLogin = { rootNavController.popBackStack() })
        }
        composable(Routes.MAIN) {
            MainScreen(onSignedOut = {
                rootNavController.navigate(Routes.LOGIN) {
                    popUpTo(Routes.MAIN) { inclusive = true }
                }
            })
        }
    }

    // React to auth changes (e.g. a token expiring) by bouncing back to the login flow.
    androidx.compose.runtime.LaunchedEffect(currentUser) {
        val onAuthScreen = rootNavController.currentDestination?.route in setOf(Routes.LOGIN, Routes.SIGN_UP)
        if (currentUser == null && !onAuthScreen) {
            rootNavController.navigate(Routes.LOGIN) { popUpTo(0) }
        } else if (currentUser != null && onAuthScreen) {
            rootNavController.navigate(Routes.MAIN) { popUpTo(0) }
        }
    }
}

@Composable
private fun MainScreen(onSignedOut: () -> Unit) {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar {
                val backStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = backStackEntry?.destination?.route
                bottomTabs.forEach { tab ->
                    NavigationBarItem(
                        selected = currentRoute == tab.route,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) }
                    )
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.FEED,
            modifier = androidx.compose.ui.Modifier.padding(padding)
        ) {
            composable(Routes.FEED) {
                FeedScreen(
                    onOpenPost = { postId -> navController.navigate(Routes.postDetail(postId)) },
                    onCreatePost = { navController.navigate(Routes.CREATE_POST) }
                )
            }
            composable(Routes.CREATE_POST) {
                CreatePostScreen(onDone = { navController.popBackStack() })
            }
            composable(
                route = Routes.POST_DETAIL,
                arguments = listOf(navArgument("postId") { })
            ) {
                PostDetailScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.CHATS) {
                ChatListScreen(onOpenChat = { chatId -> navController.navigate(Routes.chat(chatId)) })
            }
            composable(
                route = Routes.CHAT,
                arguments = listOf(navArgument("chatId") { })
            ) {
                ChatScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                    onSignedOut = onSignedOut
                )
            }
            composable(Routes.EDIT_PROFILE) {
                EditProfileScreen(onDone = { navController.popBackStack() })
            }
        }
    }
}
