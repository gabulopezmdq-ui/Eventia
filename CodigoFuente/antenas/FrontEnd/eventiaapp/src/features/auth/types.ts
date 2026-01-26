export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    expires_at_utc: string;
};
