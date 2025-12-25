import { login } from '../api/auth';
import { setToken } from '../api/client';

export const renderLoginPage = (app: HTMLElement) => {
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">💬</div>
          <h1>ChatApp</h1>
          <p>Welcome back! Sign in to continue.</p>
        </div>
        <div id="error-message"></div>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" required placeholder="Enter your username" autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="Enter your password" autocomplete="current-password" />
          </div>
          <button type="submit" class="btn btn-primary">Sign In</button>
        </form>
        <div class="auth-footer">
          Don't have an account? <a href="#" id="register-btn">Create one</a>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  const registerBtn = document.getElementById('register-btn') as HTMLButtonElement;
  const errorMessage = document.getElementById('error-message') as HTMLElement;

  registerBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'register' } }));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await login(username, password);
      setToken(response.token);
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'chatlist' } }));
    } catch (error: any) {
      errorMessage.innerHTML = `<div class="error">${error.message}</div>`;
    }
  });
};
