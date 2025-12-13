import { getUsers } from '../api/users';
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList
} from '../api/friends';

export const renderFriendsPage = async (app: HTMLElement) => {
  app.innerHTML = `
    <div class="main-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h1>Friends</h1>
          <div class="sidebar-actions">
            <button id="back-btn">← Back</button>
          </div>
        </div>
        <div class="tabs">
          <button class="tab active" data-tab="users">Find Users</button>
          <button class="tab" data-tab="requests">Requests</button>
          <button class="tab" data-tab="friends">My Friends</button>
        </div>
        <div id="tab-content" style="padding: 20px; overflow-y: auto; flex: 1;"></div>
      </div>
      <div class="chat-area">
        <div class="empty-state" style="flex: 1; display: flex; align-items: center; justify-content: center;">
          Manage your friends and connections
        </div>
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
      <input type="text" id="search-box" class="search-box" placeholder="Search users..." />
      <div id="users-list" class="user-list">
        <div class="empty-state">Loading users...</div>
      </div>
    `;

    const searchBox = document.getElementById('search-box') as HTMLInputElement;
    const usersList = document.getElementById('users-list') as HTMLElement;

    const loadUsers = async (query?: string) => {
      try {
        const users = await getUsers(query);

        if (users.length === 0) {
          usersList.innerHTML = '<div class="empty-state">No users found</div>';
        } else {
          usersList.innerHTML = users.map((user: any) => {
            const initials = user.username
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return `
              <div class="user-item">
                <div class="user-info">
                  <div class="avatar">${initials}</div>
                  <div>
                    <strong>${user.username}</strong><br/>
                    <small style="color: #888;">${user.email}</small>
                  </div>
                </div>
                <button class="btn-send" data-id="${user.id}">Add Friend</button>
              </div>
            `;
          }).join('');

          document.querySelectorAll('.btn-send').forEach(btn => {
            btn.addEventListener('click', async () => {
              const userId = (btn as HTMLElement).dataset.id!;
              try {
                await sendFriendRequest(userId);
                alert('Friend request sent!');
              } catch (error: any) {
                alert(`Error: ${error.message}`);
              }
            });
          });
        }
      } catch (error: any) {
        usersList.innerHTML = `<div class="error">${error.message}</div>`;
      }
    };

    searchBox.addEventListener('input', () => {
      const query = searchBox.value.trim();
      loadUsers(query || undefined);
    });

    await loadUsers();
  };

  const renderRequestsTab = async () => {
    tabContent.innerHTML = '<div id="requests-list" class="request-list"><div class="empty-state">Loading...</div></div>';
    const requestsList = document.getElementById('requests-list') as HTMLElement;

    try {
      const requests = await getFriendRequests();

      if (requests.length === 0) {
        requestsList.innerHTML = '<div class="empty-state">No pending requests</div>';
      } else {
        requestsList.innerHTML = requests.map((req: any) => {
          const initials = req.from.username
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return `
            <div class="request-item">
              <div class="user-info">
                <div class="avatar">${initials}</div>
                <div>
                  <strong>${req.from.username}</strong><br/>
                  <small style="color: #888;">${req.from.email}</small>
                </div>
              </div>
              <div>
                <button class="btn-accept" data-id="${req.id}">Accept</button>
                <button class="btn-reject" data-id="${req.id}">Reject</button>
              </div>
            </div>
          `;
        }).join('');

        document.querySelectorAll('.btn-accept').forEach(btn => {
          btn.addEventListener('click', async () => {
            const reqId = (btn as HTMLElement).dataset.id!;
            try {
              await acceptFriendRequest(reqId);
              alert('Friend request accepted!');
              renderRequestsTab();
            } catch (error: any) {
              alert(`Error: ${error.message}`);
            }
          });
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
          btn.addEventListener('click', async () => {
            const reqId = (btn as HTMLElement).dataset.id!;
            try {
              await rejectFriendRequest(reqId);
              alert('Friend request rejected');
              renderRequestsTab();
            } catch (error: any) {
              alert(`Error: ${error.message}`);
            }
          });
        });
      }
    } catch (error: any) {
      requestsList.innerHTML = `<div class="error">${error.message}</div>`;
    }
  };

  const renderFriendsTab = async () => {
    tabContent.innerHTML = '<div id="friends-list" class="user-list"><div class="empty-state">Loading...</div></div>';
    const friendsList = document.getElementById('friends-list') as HTMLElement;

    try {
      const friends = await getFriendsList();

      if (friends.length === 0) {
        friendsList.innerHTML = '<div class="empty-state">No friends yet</div>';
      } else {
        friendsList.innerHTML = friends.map((friend: any) => {
          const initials = friend.username
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return `
            <div class="user-item">
              <div class="user-info">
                <div class="avatar">${initials}</div>
                <div>
                  <strong>${friend.username}</strong><br/>
                  <small style="color: #888;">${friend.email}</small>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (error: any) {
      friendsList.innerHTML = `<div class="error">${error.message}</div>`;
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

  // Initial tab
  await renderUsersTab();
};
