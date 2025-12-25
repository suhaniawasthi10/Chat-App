import { getUsers } from '../api/users';
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList
} from '../api/friends';
import { escapeHtml } from '../utils/sanitize';

export const renderFriendsPage = async (app: HTMLElement) => {
  app.innerHTML = `
    <div class="friends-page">
      <div class="friends-header">
        <div class="friends-header-left">
          <button id="back-btn" class="btn btn-ghost">← Back</button>
          <h1>👥 Friends</h1>
        </div>
      </div>
      
      <div class="friends-content">
        <div class="tabs">
          <button class="tab active" data-tab="users">Find Users</button>
          <button class="tab" data-tab="requests">Requests</button>
          <button class="tab" data-tab="friends">My Friends</button>
        </div>
        
        <div id="tab-content" class="tab-content"></div>
      </div>
    </div>
  `;

  const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
  const tabs = document.querySelectorAll('.tab');
  const tabContent = document.getElementById('tab-content') as HTMLElement;

  backBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'chatlist' } }));
  });

  const renderUsersTab = async () => {
    tabContent.innerHTML = `
      <div class="search-container">
        <input type="text" id="search-box" placeholder="Search users..." />
      </div>
      <div id="users-list" class="users-grid">
        <div class="empty-state">Loading users...</div>
      </div>
    `;

    const searchBox = document.getElementById('search-box') as HTMLInputElement;
    const usersList = document.getElementById('users-list') as HTMLElement;

    try {
      const users = await getUsers();

      if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">No users found</div>';
      } else {
        const renderUsers = (filteredUsers: any[]) => {
          usersList.innerHTML = filteredUsers.map((user: any) => {
            const initials = user.username.substring(0, 2).toUpperCase();

            return `
              <div class="user-card">
                <div class="avatar">${initials}</div>
                <div class="user-card-info">
                  <strong>${escapeHtml(user.username)}</strong>
                  <span>${escapeHtml(user.email)}</span>
                </div>
                <button class="btn btn-primary btn-sm" data-id="${user.id}">Add Friend</button>
              </div>
            `;
          }).join('');

          document.querySelectorAll('.user-card .btn-primary').forEach(btn => {
            btn.addEventListener('click', async () => {
              const userId = (btn as HTMLElement).dataset.id!;
              try {
                await sendFriendRequest(userId);
                (btn as HTMLButtonElement).textContent = 'Sent ✓';
                (btn as HTMLButtonElement).disabled = true;
                (btn as HTMLButtonElement).classList.remove('btn-primary');
                (btn as HTMLButtonElement).classList.add('btn-secondary');
              } catch (error: any) {
                alert(error.message);
              }
            });
          });
        };

        renderUsers(users);

        searchBox.addEventListener('input', () => {
          const query = searchBox.value.toLowerCase();
          const filtered = users.filter((u: any) =>
            u.username.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
          );
          renderUsers(filtered);
        });
      }
    } catch (error: any) {
      usersList.innerHTML = `<div class="error">${error.message}</div>`;
    }
  };

  const renderRequestsTab = async () => {
    tabContent.innerHTML = '<div class="empty-state">Loading requests...</div>';

    try {
      const requests = await getFriendRequests();

      if (requests.length === 0) {
        tabContent.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No pending friend requests</p>
          </div>
        `;
      } else {
        tabContent.innerHTML = `
          <div class="users-grid">
            ${requests.map((req: any) => {
          const initials = req.from.username.substring(0, 2).toUpperCase();

          return `
                <div class="user-card request-card">
                  <div class="avatar">${initials}</div>
                  <div class="user-card-info">
                    <strong>${escapeHtml(req.from.username)}</strong>
                    <span>${escapeHtml(req.from.email)}</span>
                  </div>
                  <div class="request-actions">
                    <button class="btn btn-success btn-sm btn-accept" data-id="${req.id}">Accept</button>
                    <button class="btn btn-outline btn-sm btn-reject" data-id="${req.id}">Decline</button>
                  </div>
                </div>
              `;
        }).join('')}
          </div>
        `;

        document.querySelectorAll('.btn-accept').forEach(btn => {
          btn.addEventListener('click', async () => {
            const reqId = (btn as HTMLElement).dataset.id!;
            try {
              await acceptFriendRequest(reqId);
              renderRequestsTab();
            } catch (error: any) {
              alert(error.message);
            }
          });
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
          btn.addEventListener('click', async () => {
            const reqId = (btn as HTMLElement).dataset.id!;
            try {
              await rejectFriendRequest(reqId);
              renderRequestsTab();
            } catch (error: any) {
              alert(error.message);
            }
          });
        });
      }
    } catch (error: any) {
      tabContent.innerHTML = `<div class="error">${error.message}</div>`;
    }
  };

  const renderFriendsTab = async () => {
    tabContent.innerHTML = '<div class="empty-state">Loading friends...</div>';

    try {
      const friends = await getFriendsList();

      if (friends.length === 0) {
        tabContent.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">👋</div>
            <p>No friends yet</p>
            <p style="font-size: 0.813rem; margin-top: 8px; opacity: 0.7;">Find users and send friend requests!</p>
          </div>
        `;
      } else {
        tabContent.innerHTML = `
          <div class="users-grid">
            ${friends.map((friend: any) => {
          const initials = friend.username.substring(0, 2).toUpperCase();

          return `
                <div class="user-card friend-card">
                  <div class="avatar">${initials}</div>
                  <div class="user-card-info">
                    <strong>${escapeHtml(friend.username)}</strong>
                    <span>${escapeHtml(friend.email)}</span>
                  </div>
                  <button class="btn btn-ghost btn-sm">💬 Chat</button>
                </div>
              `;
        }).join('')}
          </div>
        `;
      }
    } catch (error: any) {
      tabContent.innerHTML = `<div class="error">${error.message}</div>`;
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = (tab as HTMLElement).dataset.tab;
      if (tabName === 'users') renderUsersTab();
      else if (tabName === 'requests') renderRequestsTab();
      else if (tabName === 'friends') renderFriendsTab();
    });
  });

  renderUsersTab();
};
