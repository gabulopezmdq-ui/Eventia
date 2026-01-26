import { LoginPayload } from './types';

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