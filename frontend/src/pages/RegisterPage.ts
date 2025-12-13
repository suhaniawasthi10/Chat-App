import { register } from '../api/auth';

export const renderRegisterPage = (app: HTMLElement, onSuccess: () => void) => {
    app.innerHTML = `
    <div class="auth-container">
      <h1>Create Account</h1>
      <div id="error-message"></div>
      <form id="register-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" required />
        </div>
        <button type="submit" class="btn btn-primary">Register</button>
        <button type="button" id="go-to-login" class="btn btn-secondary">
          Already have an account? Login
        </button>
      </form>
    </div>
  `;

    const form = document.getElementById('register-form') as HTMLFormElement;
    const errorDiv = document.getElementById('error-message') as HTMLElement;
    const goToLogin = document.getElementById('go-to-login') as HTMLButtonElement;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            await register(username, email, password);
            onSuccess();
        } catch (error: any) {
            errorDiv.innerHTML = `<div class="error">${error.message}</div>`;
        }
    });

    goToLogin.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }));
    });
};
