import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function GenerateCode() {
    const [invitationCode, setInvitationCode] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const generateCode = async () => {
        try {
            const response = await axios.post('/api/users/generate-invitation');
            setInvitationCode(response.data.invitationCode);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Błąd generowania kodu');
            setInvitationCode(null);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Zarządzaj kodem zaproszenia
                    </h2>
                    <p className="mt-3 text-base text-gray-500">
                        Wygeneruj nowy kod zaproszenia dla swoich pracowników.
                    </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <button
                        onClick={generateCode}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        Generuj nowy kod
                    </button>
                    {invitationCode && (
                        <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                            <p className="text-sm text-gray-500">Nowy kod zaproszenia:</p>
                            <p className="text-2xl font-bold text-gray-900">{invitationCode}</p>
                            <p className="mt-2 text-xs text-gray-500">Kod jest ważny przez 5 minut.</p>
                        </div>
                    )}
                    {error && (
                        <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
