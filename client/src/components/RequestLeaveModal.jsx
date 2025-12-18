import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { pl } from 'date-fns/locale';

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
    Calendar: () => (
        <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

export default function RequestLeaveModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        leaveType: 'vacation',
        startDate: null,
        endDate: null,
        reason: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Reset success/error on open
    useEffect(() => {
        if (isOpen) {
            setError('');
            setFormData(prev => ({ ...prev, startDate: null, endDate: null, reason: '' }));
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
         setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
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

    // Determine if reason is mandatory
    const isReasonRequired = () => {
        const optionalTypes = ['vacation', 'on_demand', 'maternity', 'paternity', 'parental'];
        return !optionalTypes.includes(formData.leaveType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate) {
            setError('Wybierz zakres dat.');
            return;
        }

        if (isReasonRequired() && !formData.reason.trim()) {
            setError('Podanie powodu jest wymagane dla tego typu urlopu.');
            return;
        }

        const days = calculateDays();

        if (days <= 0) {
            setError('Brak dni roboczych w wybranym zakresie.');
            return;
        }

        if (!user || !user.company) {
            setError('Brak danych firmy dla bieżącego użytkownika.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/leaves', { 
                ...formData, 
                days, 
                company: user.company._id,
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString()
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
    const reasonRequired = isReasonRequired();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
            <div className="w-full max-w-lg scale-100 rounded-2xl bg-white shadow-2xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-100 p-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Nowy Wniosek</h2>
                        <p className="text-sm text-gray-500">Wypełnij formularz aby złożyć wniosek urlopowy</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <Icon.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* Leave Type */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Typ urlopu
                        </label>
                        <div className="relative">
                            <select
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                            >
                                <optgroup label="Podstawowe">
                                    <option value="vacation">Urlop wypoczynkowy</option>
                                    <option value="on_demand">Urlop na żądanie</option>
                                    <option value="sick">Zwolnienie lekarskie</option>
                                </optgroup>
                                <optgroup label="Rodzicielskie">
                                    <option value="maternity">Urlop macierzyński</option>
                                    <option value="paternity">Urlop ojcowski</option>
                                    <option value="parental">Urlop rodzicielski</option>
                                    <option value="childcare">Urlop wychowawczy</option>
                                </optgroup>
                                <optgroup label="Inne">
                                    <option value="occasional">Urlop okolicznościowy</option>
                                    <option value="care">Urlop opiekuńczy</option>
                                    <option value="training">Urlop szkoleniowy</option>
                                    <option value="unpaid">Urlop bezpłatny</option>
                                    <option value="job_search">Na poszukiwanie pracy</option>
                                    <option value="health">Zdrowotny/Rehabilitacyjny</option>
                                    <option value="other">Inny</option>
                                </optgroup>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Date Picker Range */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Termin <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                                <Icon.Calendar />
                            </div>
                            <DatePicker
                                selectsRange={true}
                                startDate={formData.startDate}
                                endDate={formData.endDate}
                                onChange={handleDateChange}
                                locale={pl}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                placeholderText="Wybierz zakres dat"
                                className="w-full rounded-xl border border-gray-200 pl-10 px-4 py-3 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                                wrapperClassName="w-full"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Możesz zaznaczyć zakres klikając datę początkową i końcową.</p>
                    </div>

                    {/* Duration Info */}
                    <div className={`overflow-hidden transition-all duration-300 ${days > 0 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                         <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800 border border-emerald-100">
                            <span className="text-sm font-medium">Czas trwania urlopu:</span>
                            <span className="text-lg font-bold">{days} {days === 1 ? 'dzień roboczy' : 'dni roboczych'}</span>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Powód {reasonRequired && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="3"
                            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                            placeholder={reasonRequired ? "Opisz powód wniosku (wymagane)..." : "Dodatkowe informacje (opcjonalne)..."}
                            required={reasonRequired}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-6 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-100"
                            disabled={loading}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 font-medium text-white shadow-lg shadow-gray-200 transition-all hover:bg-black hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                    <span>Przetwarzanie...</span>
                                </> 
                            ) : (
                                'Złóż wniosek'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .react-datepicker-wrapper {
                    width: 100%;
                }
                .react-datepicker__input-container input {
                    width: 100%;
                }
            `}</style>
        </div>
    );
}
