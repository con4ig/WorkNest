import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';

const Icon = {
    ArrowRight: () => <ArrowRight className="h-5 w-5" />,
};

const LoginSchema = (t) =>
    z.object({
        email: z
            .string()
            .min(1, { message: t('auth.validation.emailRequired') })
            .email({ message: t('auth.validation.emailInvalid') }),
        password: z
            .string()
            .min(6, { message: t('auth.validation.passwordMin') }),
    });

export default function Login() {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(LoginSchema(t)),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const navigate = useNavigate();
    const { login, demoLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await login(data.email, data.password);

            if (response?.user?.mustChangePassword) {
                navigate('/force-password-change');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t('auth.login.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Left Panel - Decorative */}
            <div className="relative hidden overflow-hidden bg-primary p-12 md:flex md:w-1/2">
                <div className="relative z-10 mt-auto">
                    <h2 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground">
                        {t('auth.welcome.title')}
                    </h2>
                    <p className="max-w-md text-lg text-primary-foreground/80">
                        {t('auth.welcome.subtitle')}
                    </p>

                    <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-foreground/5 blur-3xl" />
                </div>
            </div>

            {/* Right Panel - Login Form */}

            <div className="flex flex-1 items-center justify-center bg-background p-8 transition-colors duration-300">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo & Header */}
                    <div className="text-center">
                        <Link
                            to="/"
                            className="group mb-6 inline-flex transform flex-col items-center transition-transform duration-300 hover:scale-105"
                        >
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-shadow group-hover:shadow-primary/50">
                                <span className="text-3xl font-bold text-primary-foreground">
                                    W
                                </span>
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {t('auth.login.title')}
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground">
                            {t('auth.login.noAccount')}{' '}
                            <Link
                                to="/register"
                                className="font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
                            >
                                {t('auth.login.registerLink')}
                            </Link>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await demoLogin();
                                navigate('/dashboard');
                            } catch (err) {
                                toast.error(t('auth.login.demoError'));
                                console.error(err);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="w-full rounded-xl border-2 border-dashed border-primary/50 bg-transparent py-3 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                        {t('auth.login.demoBtn')}
                    </button>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-6"
                    >
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
                                    {t('auth.login.emailLabel')}
                                </label>
                                <div className="group relative">
                                    <input
                                        id="login-email"
                                        {...register('email')}
                                        className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder={t(
                                            'auth.login.emailPlaceholder',
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                />
                                            </svg>
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-foreground">
                                    {t('auth.login.passwordLabel')}
                                </label>
                                <div className="group relative">
                                    <input
                                        id="login-password"
                                        {...register('password')}
                                        className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        type="password"
                                        placeholder="********"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                />
                                            </svg>
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-semibold shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                isLoading
                                    ? 'cursor-not-allowed bg-muted text-muted-foreground'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('auth.login.loading')}
                                </>
                            ) : (
                                <>
                                    {t('auth.login.submit')}
                                    <Icon.ArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer for production simplicity */}
                    <footer className="pt-8 pb-10 text-center text-xs text-muted-foreground">
                        <div className="mb-2">
                            &copy; {new Date().getFullYear()} WorkNest.{' '}
                            {t('landing.footer.Rights')}
                        </div>
                        <div className="space-x-3">
                            <Link
                                to="/polityka-prywatnosci"
                                className="transition-colors hover:text-primary focus-visible:underline focus-visible:outline-none"
                            >
                                {t('landing.footer.Privacy')}
                            </Link>
                            <span className="text-muted-foreground/40">|</span>
                            <Link
                                to="/regulamin"
                                className="transition-colors hover:text-primary focus-visible:underline focus-visible:outline-none"
                            >
                                {t('landing.footer.Terms')}
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
