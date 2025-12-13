import { login } from '../api/auth';
import { setToken } from '../api/client';

export const renderLoginPage = (app: HTMLElement) => {
  app.innerHTML = `
    <div class="auth-container">
      <h1>Chat App</h1>
      <p>Welcome back!</p>
      <div id="error-message"></div>
      <form id="login-form">
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="username" required placeholder="Enter your username" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password" required placeholder="Enter your password" />
        </div>
        <button type="submit" class="btn btn-primary">Sign In</button>
        <button type="button" id="register-btn" class="btn btn-secondary">Create Account</button>
      </form>
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
