import { useState } from 'react';
import axios from 'axios';

const Icon = {
    X: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    ),
};

export default function RequestLeaveModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        let count = 0;
        let current = new Date(start);

        current.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.startDate ||
            !formData.endDate ||
            !formData.reason.trim()
        ) {
            setError('Wszystkie pola są wymagane');
            return;
        }

        const days = calculateDays();

        if (days <= 0) {
            setError('Data zakończenia musi być po dacie rozpoczęcia');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(
                '/api/leaves',
                { ...formData, days },
                { withCredentials: true },
            );

            setFormData({
                leaveType: 'vacation',
                startDate: '',
                endDate: '',
                reason: '',
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating leave request:', err);
            setError(err.response?.data?.message || 'Błąd składania wniosku');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const days = calculateDays();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">Wniosek urlopowy</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                        <Icon.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Typ urlopu
                        </label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="vacation">Urlop wypoczynkowy</option>
                            <option value="sick">Zwolnienie lekarskie</option>
                            <option value="personal">
                                Urlop okolicznościowy
                            </option>
                            <option value="other">Inny</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Od <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Do <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                min={
                                    formData.startDate ||
                                    new Date().toISOString().split('T')[0]
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                    </div>

                    {days > 0 && (
                        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            Liczba dni:{' '}
                            <span className="font-bold">{days}</span>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Powód <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="4"
                            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            placeholder="Opisz powód wniosku urlopowego..."
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100"
                            disabled={loading}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Składanie...' : 'Złóż wniosek'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
