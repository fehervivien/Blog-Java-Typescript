export interface BlogPost {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

export type CreatePostDto = Omit<BlogPost, 'id' | 'createdAt'>;

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    displayName: string;
}

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
    displayName: string;
}

export interface LoginDto {
    username: string;
    password: string;
}