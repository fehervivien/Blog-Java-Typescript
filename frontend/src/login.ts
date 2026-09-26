import { loginApi } from './api';

const loginForm = document.querySelector<HTMLFormElement>('#login-form')!;
const authError = document.querySelector<HTMLParagraphElement>('#auth-error')!;

loginForm.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    authError.style.display = 'none';

    const username = (document.querySelector('#login-username') as HTMLInputElement).value.trim();
    const password = (document.querySelector('#login-password') as HTMLInputElement).value;

    try {
        const user = await loginApi({ username, password });
        localStorage.setItem('devlog_user', JSON.stringify(user));
        window.location.href = '/';
    } catch (err: any) {
        authError.textContent = err.message || 'Sikertelen bejelentkezés!';
        authError.style.display = 'block';
    }
});