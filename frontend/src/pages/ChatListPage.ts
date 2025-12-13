import { getConversations } from '../api/conversations';
import { removeToken } from '../api/client';
import { getProfile } from '../api/users';

export const renderChatListPage = async (app: HTMLElement) => {
  app.innerHTML = `
    <div class="main-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h1>Messages</h1>
          <div class="sidebar-actions">
            <button id="friends-btn">Friends</button>
            <button id="logout-btn">Logout</button>
          </div>
        </div>
        <div class="chat-list-container" id="chat-list">
          <div class="empty-state">Loading conversations...</div>
        </div>
      </div>
      <div class="chat-area">
        <div class="empty-state" style="flex: 1; display: flex; align-items: center; justify-content: center;">
          Select a conversation to start messaging
        </div>
      </div>
    </div>
  `;

  const friendsBtn = document.getElementById('friends-btn') as HTMLButtonElement;
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
  const chatList = document.getElementById('chat-list') as HTMLElement;

  friendsBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'friends' } }));
  });

  logoutBtn.addEventListener('click', () => {
    removeToken();
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }));
  });

  try {
    // Get current user ID to filter out from participant names
    const profile = await getProfile();
    const currentUserId = profile.id;

    const conversations = await getConversations();

    if (conversations.length === 0) {
      chatList.innerHTML = '<div class="empty-state">No conversations yet. Add friends to start chatting!</div>';
    } else {
      chatList.innerHTML = conversations.map((conv: any) => {
        // Filter out current user from participants and show only friend names
        const otherParticipants = conv.participants
          .filter((p: any) => String(p.id) !== String(currentUserId))
          .map((p: any) => p.username)
          .join(', ');

        // Get initials for avatar
        const initials = otherParticipants
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        const lastMsg = conv.lastMessage
          ? `${conv.lastMessage.sender.username}: ${conv.lastMessage.text}`
          : 'No messages yet';

        return `
          <div class="conversation-item" data-id="${conv.id}">
            <div class="avatar">${initials}</div>
            <div class="conversation-info">
              <h3>${conv.isGroup ? conv.name : otherParticipants}</h3>
              <p>${lastMsg}</p>
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers
      document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
          const convId = (item as HTMLElement).dataset.id;
          window.dispatchEvent(new CustomEvent('navigate', {
            detail: { page: 'chat', conversationId: convId }
          }));
        });
      });
    }
  } catch (error: any) {
    chatList.innerHTML = `<div class="error">${error.message}</div>`;
  }
};
