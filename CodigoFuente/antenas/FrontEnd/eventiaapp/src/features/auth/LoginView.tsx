import Link from 'next/link';
import { LoginForm } from './LoginForm';

export function LoginView() {
    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-white mb-2">
                    Bienvenido de nuevo
                </h1>
                <p className="text-neutral-400">
                    Tus eventos siguen vivos acá
                </p>
            </div>

            <LoginForm />

            {/* Footer */}
            <p className="text-center text-neutral-500 text-sm mt-6">
                ¿No tenés cuenta?{' '}
                <Link
                    href="/register"
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                    Registrate gratis
                </Link>
            </p>
        </div>
    );
}
