import { LoginPayload, RegisterPayload, AuthMeResponse } from './types';

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

/**
 * Obtiene el perfil completo del usuario autenticado desde el backend.
 * Incluye flags de UI (ui.*), contexto de cuenta B2B y cantidad de eventos.
 * Usar junto con AuthContext para gobernar la navegación.
 */
export async function getAuthMe(): Promise<AuthMeResponse> {
    const res = await fetch('/api/auth/me', {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Sesión inválida o expirada');
    }

    return res.json();
}