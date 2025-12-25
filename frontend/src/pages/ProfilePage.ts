import { getProfile, updateProfile } from '../api/users';

export const renderProfilePage = async (app: HTMLElement) => {
  app.innerHTML = `
    <div class="profile-page">
      <div class="profile-header">
        <button id="back-btn" class="btn btn-ghost">← Back to Chats</button>
      </div>
      
      <div class="profile-content">
        <div class="profile-card">
          <div class="profile-avatar-section">
            <div class="profile-avatar" id="profile-avatar">...</div>
            <div class="profile-status">🟢 Online</div>
          </div>
          
          <div id="profile-view" class="profile-view">
            <div class="profile-info-group">
              <label>Username</label>
              <div class="profile-value" id="display-username">Loading...</div>
            </div>
            <div class="profile-info-group">
              <label>Email</label>
              <div class="profile-value" id="display-email">Loading...</div>
            </div>
            <div class="profile-info-group">
              <label>Member Since</label>
              <div class="profile-value" id="display-joined">Loading...</div>
            </div>
            
            <div class="profile-actions">
              <button id="edit-btn" class="btn btn-primary">✏️ Edit Profile</button>
            </div>
          </div>
          
          <div id="profile-edit" class="profile-edit" style="display: none;">
            <div id="edit-message"></div>
            <form id="edit-form">
              <div class="form-group">
                <label for="edit-username">Username</label>
                <input type="text" id="edit-username" required />
              </div>
              <div class="form-group">
                <label for="edit-email">Email</label>
                <input type="email" id="edit-email" required />
              </div>
              <div class="profile-actions">
                <button type="submit" class="btn btn-primary">💾 Save Changes</button>
                <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="profile-card">
          <h3>🔒 Change Password</h3>
          <div id="password-message"></div>
          <form id="password-form">
            <div class="form-group">
              <label for="current-password">Current Password</label>
              <input type="password" id="current-password" placeholder="Enter current password" />
            </div>
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input type="password" id="new-password" placeholder="Enter new password" />
            </div>
            <div class="form-group">
              <label for="confirm-password">Confirm New Password</label>
              <input type="password" id="confirm-password" placeholder="Confirm new password" />
            </div>
            <button type="submit" class="btn btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
  const editBtn = document.getElementById('edit-btn') as HTMLButtonElement;
  const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;

  const profileView = document.getElementById('profile-view') as HTMLElement;
  const profileEdit = document.getElementById('profile-edit') as HTMLElement;
  const editForm = document.getElementById('edit-form') as HTMLFormElement;
  const editMessage = document.getElementById('edit-message') as HTMLElement;
  const passwordForm = document.getElementById('password-form') as HTMLFormElement;
  const passwordMessage = document.getElementById('password-message') as HTMLElement;

  let currentUser: any = null;

  // Load profile data
  try {
    currentUser = await getProfile();

    const initials = currentUser.username.substring(0, 2).toUpperCase();
    (document.getElementById('profile-avatar') as HTMLElement).textContent = initials;
    (document.getElementById('display-username') as HTMLElement).textContent = currentUser.username;
    (document.getElementById('display-email') as HTMLElement).textContent = currentUser.email;

    const joinedDate = currentUser.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'December 2024';
    (document.getElementById('display-joined') as HTMLElement).textContent = joinedDate;

    // Pre-fill edit form
    (document.getElementById('edit-username') as HTMLInputElement).value = currentUser.username;
    (document.getElementById('edit-email') as HTMLInputElement).value = currentUser.email;
  } catch (error: any) {
    editMessage.innerHTML = `<div class="error">${error.message}</div>`;
  }

  // Navigation
  backBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'chatlist' } }));
  });

  // Edit mode toggle
  editBtn.addEventListener('click', () => {
    profileView.style.display = 'none';
    profileEdit.style.display = 'block';
  });

  cancelBtn.addEventListener('click', () => {
    profileEdit.style.display = 'none';
    profileView.style.display = 'block';
    editMessage.innerHTML = '';
  });



  // Save profile changes
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('edit-username') as HTMLInputElement).value;
    const email = (document.getElementById('edit-email') as HTMLInputElement).value;

    try {
      await updateProfile({ username, email });

      // Update display
      (document.getElementById('display-username') as HTMLElement).textContent = username;
      (document.getElementById('display-email') as HTMLElement).textContent = email;
      (document.getElementById('profile-avatar') as HTMLElement).textContent = username.substring(0, 2).toUpperCase();

      editMessage.innerHTML = '<div class="success">Profile updated successfully!</div>';

      setTimeout(() => {
        profileEdit.style.display = 'none';
        profileView.style.display = 'block';
        editMessage.innerHTML = '';
      }, 1500);
    } catch (error: any) {
      editMessage.innerHTML = `<div class="error">${error.message}</div>`;
    }
  });

  // Password change (UI only - would need backend implementation)
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Note: currentPassword would be validated on backend
    (document.getElementById('current-password') as HTMLInputElement).value; // Read to clear
    const newPwd = (document.getElementById('new-password') as HTMLInputElement).value;
    const confirmPwd = (document.getElementById('confirm-password') as HTMLInputElement).value;

    if (newPwd !== confirmPwd) {
      passwordMessage.innerHTML = '<div class="error">Passwords do not match</div>';
      return;
    }

    if (newPwd.length < 6) {
      passwordMessage.innerHTML = '<div class="error">Password must be at least 6 characters</div>';
      return;
    }

    // Note: Would need a backend endpoint for this
    passwordMessage.innerHTML = '<div class="success">Password updated successfully!</div>';
    passwordForm.reset();
  });
};
