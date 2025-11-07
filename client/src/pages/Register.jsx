import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

const Icon = {
    ArrowRight: () => <ArrowRight className="h-5 w-5" />,
};

export default function Register() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();
    const [isRegisteringCompany, setIsRegisteringCompany] = useState(true);

    const onSubmit = async (data) => {
        try {
            const registrationData = {
                email: data.email,
                username: data.username,
                password: data.password,
            };

            if (isRegisteringCompany) {
                registrationData.role = 'admin';
                registrationData.companyName = data.companyName;
            } else {
                registrationData.role = 'employee';
                registrationData.invitationCode = data.invitationCode;
            }

            const response = await axios.post(
                '/api/auth/register',
                registrationData,
            );

            if (isRegisteringCompany && response.data.company?.invitationCode) {
                alert(
                    `Rejestracja firmy zakończona sukcesem!\n\nTwój kod zaproszenia dla pracowników to: ${response.data.company.invitationCode}\n\nZapisz go! Zostaniesz teraz przeniesiony do strony logowania.`,
                );
            } else {
                alert('Rejestracja zakończona sukcesem!');
            }
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Błąd rejestracji');
        }
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Left Panel - Decorative */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-12 md:flex md:w-1/2">
                <div className="relative z-10 mt-auto">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                        Witaj w WorkNest
                    </h2>
                    <p className="max-w-md text-lg text-emerald-50">
                        Platforma, która pomoże Ci zarządzać projektami i
                        zespołem w jednym miejscu.
                    </p>

                    {/* Decorative elements */}
                    <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-emerald-800/20 blur-3xl" />
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo & Header */}
                    <div className="text-center">
                        <Link
                            to="/"
                            className="group mb-6 inline-flex transform flex-col items-center transition-transform duration-300 hover:scale-105"
                        >
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/50">
                                <span className="text-3xl font-bold text-white">
                                    W
                                </span>
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Zarejestruj się do konta
                        </h2>
                        <p className="mt-3 text-base text-gray-500">
                            Masz już konto?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-emerald-600 transition-colors hover:text-emerald-500"
                            >
                                Zaloguj się
                            </Link>
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-8"
                    >
                        <div className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Adres email
                                </label>
                                <div className="group relative">
                                    <input
                                        {...register('email', {
                                            required: 'Email jest wymagany',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message:
                                                    'Nieprawidłowy format email',
                                            },
                                        })}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="jan.kowalski@firma.pl"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
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
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Nazwa użytkownika
                                </label>
                                <div className="group relative">
                                    <input
                                        {...register('username', {
                                            required:
                                                'Nazwa użytkownika jest wymagana',
                                        })}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="Jan.Kowalski"
                                    />
                                    {errors.username && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
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
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Hasło
                                </label>
                                <div className="group relative">
                                    <input
                                        {...register('password', {
                                            required: 'Hasło jest wymagane',
                                            minLength: {
                                                value: 6,
                                                message:
                                                    'Hasło musi mieć co najmniej 6 znaków',
                                            },
                                        })}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        type="password"
                                        placeholder="********"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
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

                            {/* Company Registration / Invitation Code Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="register-company"
                                        name="register-company"
                                        type="checkbox"
                                        checked={isRegisteringCompany}
                                        onChange={() =>
                                            setIsRegisteringCompany(
                                                !isRegisteringCompany,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label
                                        htmlFor="register-company"
                                        className="ml-2 block text-sm text-gray-900"
                                    >
                                        Rejestruję nową firmę
                                    </label>
                                </div>
                            </div>

                            {isRegisteringCompany ? (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Nazwa firmy
                                    </label>
                                    <div className="group relative">
                                        <input
                                            {...register('companyName', {
                                                required: isRegisteringCompany
                                                    ? 'Nazwa firmy jest wymagana'
                                                    : false,
                                            })}
                                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="Nazwa Twojej firmy"
                                        />
                                        {errors.companyName && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
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
                                                {errors.companyName.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Kod zaproszenia
                                    </label>
                                    <div className="group relative">
                                        <input
                                            {...register('invitationCode', {
                                                required: !isRegisteringCompany
                                                    ? 'Kod zaproszenia jest wymagany'
                                                    : false,
                                            })}
                                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="Wprowadź kod zaproszenia"
                                        />
                                        {errors.invitationCode && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
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
                                                {errors.invitationCode.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                            Zarejestruj się
                            <Icon.ArrowRight />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
