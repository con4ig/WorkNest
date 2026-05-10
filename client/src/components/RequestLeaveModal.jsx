import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { pl } from 'date-fns/locale';

import { X, Calendar as CalendarIcon, Clock, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-lg scale-100 overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-black/5 dark:border-white/5 p-8 sm:p-10">
                    <div className="absolute -left-4 -top-4 rounded-full bg-primary/10 p-12 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t('leaves.myLeaves.newRequest')}</h2>
                        <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('leaves.myLeaves.modalSubtitle') || 'Wypełnij formularz aby złożyć wniosek urlopowy'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8 p-8 sm:p-10">
                    {error && (
                        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/10 bg-rose-500/5 px-4 py-3 text-sm font-bold text-rose-500 animate-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Leave Type */}
                        <div className="group space-y-2">
                            <label htmlFor="leave-type" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within:text-primary">
                                {t('common.type')}
                            </label>
                            <div className="relative">
                                <select
                                    id="leave-type"
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 font-bold text-zinc-900 dark:text-white outline-none transition-all focus:border-primary/50 focus:bg-black/[0.08] dark:focus:bg-white/[0.08]"
                                >
                                    <optgroup label="Podstawowe" className="bg-white dark:bg-zinc-900 font-sans">
                                        <option value="vacation">Urlop wypoczynkowy</option>
                                        <option value="on_demand">Urlop na żądanie</option>
                                        <option value="sick">Zwolnienie lekarskie</option>
                                    </optgroup>
                                    <optgroup label="Rodzicielskie" className="bg-white dark:bg-zinc-900 font-sans">
                                        <option value="maternity">Urlop macierzyński</option>
                                        <option value="paternity">Urlop ojcowski</option>
                                        <option value="parental">Urlop rodzicielski</option>
                                        <option value="childcare">Urlop wychowawczy</option>
                                    </optgroup>
                                    <optgroup label="Inne" className="bg-white dark:bg-zinc-900 font-sans">
                                        <option value="occasional">Urlop okolicznościowy</option>
                                        <option value="care">Urlop opiekuńczy</option>
                                        <option value="training">Urlop szkoleniowy</option>
                                        <option value="unpaid">Urlop bezpłatny</option>
                                        <option value="job_search">Na poszukiwanie pracy</option>
                                        <option value="health">Zdrowotny/Rehabilitacyjny</option>
                                        <option value="other">Inny</option>
                                    </optgroup>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within:text-primary">
                                {t('common.dates')} <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-zinc-500">
                                    <CalendarIcon className="h-5 w-5" />
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
                                    className="w-full rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 py-4 pl-12 pr-4 font-bold text-zinc-900 dark:text-white outline-none transition-all focus:border-primary/50 focus:bg-black/[0.08] dark:focus:bg-white/[0.08]"
                                    wrapperClassName="w-full"
                                />
                            </div>
                        </div>

                        {/* Duration Banner */}
                        <div className={clsx(
                            "overflow-hidden transition-all duration-500",
                            days > 0 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                        )}>
                            <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-primary">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 stroke-[3]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Czas trwania</span>
                                </div>
                                <span className="text-lg font-black italic">
                                    {days} {days === 1 ? 'dzień roboczy' : 'dni roboczych'}
                                </span>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="group space-y-2">
                            <label htmlFor="leave-reason" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within:text-primary">
                                {t('common.reason')} {isReasonRequired() && <span className="text-rose-500">*</span>}
                            </label>
                            <textarea
                                id="leave-reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="3"
                                className="w-full resize-none rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 font-medium text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-primary/50 focus:bg-black/[0.08] dark:focus:bg-white/[0.08]"
                                placeholder={isReasonRequired() ? "Opisz powód wniosku (wymagane)..." : "Dodatkowe informacje (opcjonalne)..."}
                                required={isReasonRequired()}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 transition-all hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                            disabled={loading}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 font-black transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
                                    <span className="uppercase tracking-widest text-xs text-black">Przetwarzanie...</span>
                                </> 
                            ) : (
                                <span className="uppercase tracking-widest text-xs text-black">Złóż wniosek</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <style>{`
                .react-datepicker {
                    background-color: white !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                    border-radius: 1.5rem !important;
                    font-family: inherit !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
                    padding: 1rem !important;
                }
                .dark .react-datepicker {
                    background-color: #18181b !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                }
                .react-datepicker__header {
                    background-color: transparent !important;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
                    padding-top: 0 !important;
                }
                .dark .react-datepicker__header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                .react-datepicker__current-month, .react-datepicker__day-name {
                    color: #18181b !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    font-size: 0.75rem !important;
                }
                .dark .react-datepicker__current-month, .dark .react-datepicker__day-name {
                    color: white !important;
                }
                .react-datepicker__day {
                    color: #71717a !important;
                    font-weight: 600 !important;
                    border-radius: 0.75rem !important;
                }
                .react-datepicker__day:hover {
                    background-color: rgba(0, 0, 0, 0.05) !important;
                    color: #18181b !important;
                }
                .dark .react-datepicker__day:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    color: white !important;
                }
                .react-datepicker__day--selected, .react-datepicker__day--in-range {
                    background-color: var(--primary) !important;
                    color: black !important;
                }
                .react-datepicker__day--keyboard-selected {
                    background-color: transparent !important;
                    border: 2px solid var(--primary) !important;
                }
                .react-datepicker__day--outside-month {
                    opacity: 0.2 !important;
                }
                .react-datepicker__navigation-icon::before {
                    border-color: #71717a !important;
                }
            `}</style>
        </div>
    );
}
