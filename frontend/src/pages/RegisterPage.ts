import { register } from '../api/auth';

export const renderRegisterPage = (app: HTMLElement) => {
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">✨</div>
          <h1>Create Account</h1>
          <p>Join ChatApp and start chatting!</p>
        </div>
        <div id="error-message"></div>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" required placeholder="Choose a username" autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required placeholder="Enter your email" autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="Create a password" autocomplete="new-password" />
          </div>
          <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
        <div class="auth-footer">
          Already have an account? <a href="#" id="go-to-login">Sign in</a>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('register-form') as HTMLFormElement;
  const errorDiv = document.getElementById('error-message') as HTMLElement;
  const goToLogin = document.getElementById('go-to-login') as HTMLElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await register(username, email, password);
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'chatlist' } }));
    } catch (error: any) {
      errorDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
  });

  goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }));
  });
};
