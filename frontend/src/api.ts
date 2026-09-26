import { BlogPost, CreatePostDto, AuthUser, RegisterDto, LoginDto } from './types';

const BASE_URL = 'http://localhost:8080/api/posts';
const AUTH_URL = 'http://localhost:8080/api/auth';


// Segédfüggvény a token kinyeréséhez
function getAuthHeader(): { [key: string]: string } {
    const userStr = localStorage.getItem('devlog_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.token) {
            return { 'Authorization': `Bearer ${user.token}` };
        }
    }
    return {};
}

export async function fetchPosts(): Promise<BlogPost[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Nem sikerült betölteni a bejegyzéseket');
    return res.json();
}

export async function createPost(post: CreatePostDto): Promise<BlogPost> {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Nem sikerült létrehozni a cikket');
    return res.json();
}

export async function updatePost(id: number, post: CreatePostDto): Promise<BlogPost> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Nem sikerült módosítani a bejegyzést');
    return res.json();
}

export async function deletePost(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Törlés sikertelen');
}


export async function registerApi(dto: RegisterDto): Promise<AuthUser> {
    const res = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Sikertelen regisztráció');
    }
    return res.json();
}

export async function loginApi(dto: LoginDto): Promise<AuthUser> {
    const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Sikertelen bejelentkezés');
    }
    return res.json();
}