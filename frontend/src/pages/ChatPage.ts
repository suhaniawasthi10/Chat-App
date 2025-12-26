import { getConversations, getMessages } from '../api/conversations';
import { sendMessage } from '../api/messages';
import { getProfile } from '../api/users';
import { connectSocket, joinConversation, leaveConversation, onNewMessage, offNewMessage } from '../api/socket';
import { escapeHtml } from '../utils/sanitize';

let currentUserId: string | null = null;
let currentMessages: any[] = [];

export const renderChatPage = async (app: HTMLElement, conversationId: string) => {
  // Get current user
  if (!currentUserId) {
    const profile = await getProfile();
    currentUserId = profile.id;
  }

  // Get conversation details to show friend's name and status
  let chatTitle = 'Chat';
  let chatStatus = '';

  try {
    const conversations = await getConversations();
    const currentConv = conversations.find((c: any) => c.id === conversationId);
    if (currentConv) {
      const otherParticipant = currentConv.participants.find(
        (p: any) => String(p.id) !== String(currentUserId)
      );

      const otherParticipants = currentConv.participants
        .filter((p: any) => String(p.id) !== String(currentUserId))
        .map((p: any) => p.username);

      chatTitle = currentConv.isGroup
        ? currentConv.name || otherParticipants.join(', ')
        : otherParticipants[0] || 'Chat';

      // Calculate status if single chat
      if (!currentConv.isGroup && otherParticipant && otherParticipant.lastActive) {
        const lastActiveDate = new Date(otherParticipant.lastActive);
        if (!isNaN(lastActiveDate.getTime())) {
          const now = new Date().getTime();
          const diff = now - lastActiveDate.getTime();
          const minutes = Math.floor(diff / 60000);

          if (minutes < 5) {
            chatStatus = `<span class="online-dot"></span><span class="status-online">Online</span>`;
          } else if (minutes < 60) {
            chatStatus = `<span class="status-offline">Last seen ${minutes}m ago</span>`;
          } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            chatStatus = `<span class="status-offline">Last seen ${hours}h ago</span>`;
          } else {
            chatStatus = `<span class="status-offline">Offline</span>`;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading conversation:', error);
  }

  app.innerHTML = `
    <div class="main-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h1>Messages</h1>
          <div class="sidebar-actions">
            <button id="back-btn">← Back</button>
          </div>
        </div>
        <div class="chat-list-container" id="sidebar-conversations">
          <div class="empty-state">Loading...</div>
        </div>
      </div>
      <div class="chat-area">
        <div class="chat-header">
          <div class="chat-header-info">
            <h2>
              ${chatTitle}
              <div class="user-status">${chatStatus}</div>
            </h2>
          </div>
        </div>
        <div class="messages-container" id="messages"></div>
        <div class="message-input-container">
          <input type="text" id="message-input" placeholder="Type a message..." />
          <button id="send-btn">➤</button>
        </div>
      </div>
    </div>
  `;

  const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
  const messagesContainer = document.getElementById('messages') as HTMLElement;
  const messageInput = document.getElementById('message-input') as HTMLInputElement;
  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;

  backBtn.addEventListener('click', () => {
    // Cleanup WebSocket listeners when leaving
    leaveConversation(conversationId);
    offNewMessage();
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'chatlist' } }));
  });

  // Store messages for real-time updates
  let lastMessageId: string | null = null;

  const loadMessages = async () => {
    try {
      const messages = await getMessages(conversationId);

      // smart update: only render if we have new messages or no messages loaded yet
      if (messages.length > 0) {
        const uniqueKey = messages[messages.length - 1].id;
        // Simple check: if last message ID changed, or count changed, re-render
        // Ideally we'd compare full list, but this stops the constant flickering
        const currentCount = messagesContainer.querySelectorAll('.message').length;

        if (lastMessageId !== uniqueKey || currentCount !== messages.length) {
          currentMessages = messages; // Store for real-time updates
          renderMessages(messages);
          lastMessageId = uniqueKey;
        }
      } else if (messages.length === 0 && lastMessageId !== 'empty') {
        currentMessages = [];
        renderMessages([]);
        lastMessageId = 'empty';
      }

    } catch (error: any) {
      // Don't overwrite error on every poll if it's already there
      if (!messagesContainer.innerHTML.includes('error')) {
        messagesContainer.innerHTML = `<div class="error">${error.message}</div>`;
      }
    }
  };

  const renderMessages = (messages: any[]) => {
    if (messages.length === 0) {
      messagesContainer.innerHTML = '<div class="empty-state">No messages yet. Start the conversation!</div>';
      return;
    }

    // Save scroll position
    const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop === messagesContainer.clientHeight;

    let lastDate = '';

    messagesContainer.innerHTML = messages.map(msg => {
      const msgDate = new Date(msg.createdAt);
      const dateStr = msgDate.toDateString();
      let dateDivider = '';

      if (dateStr !== lastDate) {
        lastDate = dateStr;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let displayDate = dateStr;

        if (dateStr === today) displayDate = 'Today';
        else if (dateStr === yesterday) displayDate = 'Yesterday';
        else {
          displayDate = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }

        dateDivider = `<div class="date-divider"><span>${displayDate}</span></div>`;
      }

      const isSent = msg.sender.id === currentUserId;
      const time = msgDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        ${dateDivider}
        <div class="message ${isSent ? 'sent' : 'received'}">
          ${!isSent ? `<div class="message-sender">${escapeHtml(msg.sender.username)}</div>` : ''}
          <div class="message-bubble">${escapeHtml(msg.text)}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
    }).join('');

    // Restore scroll if at bottom or initial load
    if (isAtBottom || !lastMessageId) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    try {
      await sendMessage(conversationId, text);
      messageInput.value = '';
      await loadMessages();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  sendBtn.addEventListener('click', handleSendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });

  // Setup WebSocket for real-time messages FIRST
  connectSocket();
  joinConversation(conversationId);

  // Listen for new messages via WebSocket
  onNewMessage((message: any) => {
    console.log('📨 New message received via WebSocket:', message);
    // Only add if it's for this conversation and not already in the list
    if (message.conversation === conversationId) {
      const exists = currentMessages.some(m => m.id === message.id);
      if (!exists) {
        currentMessages.push(message);
        renderMessages(currentMessages);
        // Scroll to bottom for new messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  });

  // Initial load
  await loadMessages();

  // Load sidebar conversations
  loadSidebarConversations(conversationId);
};

async function loadSidebarConversations(activeConvId: string) {
  try {
    const profile = await getProfile();
    const currentUserId = profile.id;
    const conversations = await getConversations();
    const sidebarContainer = document.getElementById('sidebar-conversations');

    if (!sidebarContainer) return;

    if (conversations.length === 0) {
      sidebarContainer.innerHTML = '<div class="empty-state">No conversations</div>';
      return;
    }

    sidebarContainer.innerHTML = conversations.map((conv: any) => {
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
        ? `${escapeHtml(conv.lastMessage.sender.username)}: ${escapeHtml(conv.lastMessage.text)}`
        : 'No messages yet';

      const isActive = conv.id === activeConvId ? 'active' : '';

      return `
        <div class="conversation-item ${isActive}" data-id="${conv.id}">
          <div class="avatar">${initials}</div>
          <div class="conversation-info">
            <h3>${conv.isGroup ? escapeHtml(conv.name || '') : otherParticipants}</h3>
            <p>${lastMsg}</p>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const convId = (item as HTMLElement).dataset.id;
        if (convId !== activeConvId) {
          window.dispatchEvent(new CustomEvent('navigate', {
            detail: { page: 'chat', conversationId: convId }
          }));
        }
      });
    });
  } catch (error) {
    console.error('Error loading sidebar conversations:', error);
  }
}
