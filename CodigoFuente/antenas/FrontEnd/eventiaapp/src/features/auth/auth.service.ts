import { LoginPayload, RegisterPayload } from './types';

export async function login(payload: LoginPayload) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Credenciales inválidas');
    }

    return res.json();
}

export async function logout() {
    await fetch('/api/auth/logout', {
        method: 'POST',
    });
}

export async function register(payload: RegisterPayload) {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al registrar usuario');
    }

    return res.json();
}

export async function loginWithGoogle(idToken: string) {
    const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
        throw new Error('Error al autenticar con Google');
    }

    return res.json();
}