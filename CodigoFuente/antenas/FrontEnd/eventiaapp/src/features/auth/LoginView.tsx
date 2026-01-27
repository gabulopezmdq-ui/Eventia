import { LoginForm } from './LoginForm';

export function LoginView() {
    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-semibold text-white">
                Bienvenido de nuevo
            </h1>
            <p className="text-neutral-400 mb-6">
                Tus eventos siguen vivos acá
            </p>

            <LoginForm />
        </div>
    );
}
