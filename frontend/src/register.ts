import { registerApi } from './api';

const registerForm = document.querySelector<HTMLFormElement>('#register-form')!;
const regError = document.querySelector<HTMLParagraphElement>('#reg-error')!;

registerForm.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    regError.style.display = 'none';

    const username = (document.querySelector('#reg-username') as HTMLInputElement).value.trim();
    const email = (document.querySelector('#reg-email') as HTMLInputElement).value.trim();
    const displayName = (document.querySelector('#reg-display-name') as HTMLInputElement).value.trim();
    const password = (document.querySelector('#reg-password') as HTMLInputElement).value;

    try {
        const user = await registerApi({ username, email, displayName, password });
        localStorage.setItem('devlog_user', JSON.stringify(user));
        window.location.href = '/';
    } catch (err: any) {
        regError.textContent = err.message || 'Sikertelen regisztráció!';
        regError.style.display = 'block';
    }
});