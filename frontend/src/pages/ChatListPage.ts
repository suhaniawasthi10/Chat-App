import { getConversations } from '../api/conversations';
import { removeToken } from '../api/client';
import { getProfile } from '../api/users';
import { escapeHtml } from '../utils/sanitize';

export const renderChatListPage = async (app: HTMLElement) => {
  app.innerHTML = `
    <div class="main-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h1>💬 ChatApp</h1>
          <div class="sidebar-actions">
            <button id="friends-btn" class="btn btn-icon" title="Friends">👥</button>
            <button id="logout-btn" class="btn btn-icon" title="Logout">🚪</button>
          </div>
        </div>
        <div class="sidebar-search">
          <input type="text" id="search-input" placeholder="Search conversations..." />
        </div>
        <div class="section-header">
          <span>Messages</span>
        </div>
        <div class="chat-list-container" id="chat-list">
          <div class="empty-state">Loading...</div>
        </div>
        <div class="sidebar-footer">
          <div class="user-profile" id="user-profile">
            <div class="avatar">...</div>
            <div class="user-profile-info">
              <div class="username">Loading...</div>
              <div class="status">Online</div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-area">
        <div class="chat-placeholder">
          <div class="chat-placeholder-icon">💬</div>
          <h2>Select a conversation</h2>
          <p>Choose a friend from the sidebar to start chatting</p>
        </div>
      </div>
    </div>
  `;

  const friendsBtn = document.getElementById('friends-btn') as HTMLButtonElement;
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
  const chatList = document.getElementById('chat-list') as HTMLElement;
  const userProfileEl = document.getElementById('user-profile') as HTMLElement;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  friendsBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'friends' } }));
  });

  logoutBtn.addEventListener('click', () => {
    removeToken();
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }));
  });

  let allConversations: any[] = [];

  try {
    const profile = await getProfile();
    const currentUserId = profile.id;

    // Update user profile section
    const initials = profile.username.substring(0, 2).toUpperCase();
    userProfileEl.innerHTML = `
      <div class="avatar">${initials}</div>
      <div class="user-profile-info">
        <div class="username">${escapeHtml(profile.username)}</div>
        <div class="status">Online</div>
      </div>
      <span class="profile-arrow">›</span>
    `;
    userProfileEl.style.cursor = 'pointer';
    userProfileEl.title = 'View Profile';
    userProfileEl.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
    });

    allConversations = await getConversations();

    const renderConversations = (conversations: any[]) => {
      if (conversations.length === 0) {
        chatList.innerHTML = `
          <div class="empty-state">
            <p>No conversations yet</p>
            <p style="font-size: 0.75rem; margin-top: 8px;">Add friends to start chatting!</p>
          </div>
        `;
        return;
      }

      chatList.innerHTML = conversations.map((conv: any) => {
        const otherParticipants = conv.participants
          .filter((p: any) => String(p.id) !== String(currentUserId))
          .map((p: any) => escapeHtml(p.username))
          .join(', ');

        const initials = otherParticipants
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        const lastMsg = conv.lastMessage
          ? escapeHtml(conv.lastMessage.text).substring(0, 30) + (conv.lastMessage.text.length > 30 ? '...' : '')
          : 'No messages yet';

        const lastTime = conv.lastMessage
          ? new Date(conv.lastMessage.timestamp || conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return `
          <div class="conversation-item" data-id="${conv.id}">
            <div class="avatar">${initials}</div>
            <div class="conversation-info">
              <h3>${conv.isGroup ? escapeHtml(conv.name || '') : otherParticipants}</h3>
              <p>${lastMsg}</p>
            </div>
            <div class="conversation-meta">
              <span class="conversation-time">${lastTime}</span>
            </div>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
          const convId = (item as HTMLElement).dataset.id;
          window.dispatchEvent(new CustomEvent('navigate', {
            detail: { page: 'chat', conversationId: convId }
          }));
        });
      });
    };

    renderConversations(allConversations);

    // Search functionality
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      const filtered = allConversations.filter((conv: any) => {
        const names = conv.participants
          .filter((p: any) => String(p.id) !== String(currentUserId))
          .map((p: any) => p.username.toLowerCase())
          .join(' ');
        return names.includes(query) || (conv.name && conv.name.toLowerCase().includes(query));
      });
      renderConversations(filtered);
    });

  } catch (error: any) {
    chatList.innerHTML = `<div class="error">${error.message}</div>`;
  }
};
