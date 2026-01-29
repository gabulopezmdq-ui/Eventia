export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    expires_at_utc: string;
};
export interface RegisterPayload {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
}

export interface RegisterResponse {
    success: boolean;
}

export interface GoogleAuthPayload {
    idToken: string;
}
