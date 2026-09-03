import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

const db = getFirestore();
const messaging = getMessaging();

/** Sends `notification` to every FCM token registered for `uid`, pruning tokens that bounce. */
async function notifyUser(uid: string, notification: { title: string; body: string }) {
  const userSnap = await db.collection("users").doc(uid).get();
  const tokens: string[] = userSnap.get("fcmTokens") ?? [];
  if (tokens.length === 0) return;

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification,
    android: { priority: "high" },
  });

  const staleTokens = response.responses
    .map((res, i) => (res.success ? null : tokens[i]))
    .filter((t): t is string => t !== null);

  if (staleTokens.length > 0) {
    await db.collection("users").doc(uid).update({
      fcmTokens: tokens.filter((t) => !staleTokens.includes(t)),
    });
  }
}

/** New chat message -> push the other participant(s). */
export const onNewChatMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const message = event.data?.data();
    if (!message) return;

    const chatSnap = await db.collection("chats").doc(event.params.chatId).get();
    const chat = chatSnap.data();
    if (!chat) return;

    const senderName: string = chat.participantNames?.[message.senderId] ?? "Someone";
    const recipients: string[] = (chat.participantIds ?? []).filter(
      (id: string) => id !== message.senderId
    );

    await Promise.all(
      recipients.map((uid) =>
        notifyUser(uid, {
          title: senderName,
          body: message.text?.trim() ? message.text : "Sent you a photo",
        })
      )
    );
  }
);

/** New comment on a post -> push the post author (unless they commented on their own post). */
export const onNewComment = onDocumentCreated(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    const comment = event.data?.data();
    if (!comment) return;

    const postSnap = await db.collection("posts").doc(event.params.postId).get();
    const post = postSnap.data();
    if (!post || post.authorId === comment.authorId) return;

    await notifyUser(post.authorId, {
      title: `${comment.authorName ?? "Someone"} commented on your post`,
      body: comment.text,
    });
  }
);

/** New like on a post -> push the post author. */
export const onNewLike = onDocumentCreated(
  "posts/{postId}/likes/{likerUid}",
  async (event) => {
    const likerUid = event.params.likerUid as string;

    const postSnap = await db.collection("posts").doc(event.params.postId).get();
    const post = postSnap.data();
    if (!post || post.authorId === likerUid) return;

    const likerSnap = await db.collection("users").doc(likerUid).get();
    const likerName = likerSnap.get("displayName") ?? "Someone";

    await notifyUser(post.authorId, {
      title: "New like",
      body: `${likerName} liked your post`,
    });
  }
);
