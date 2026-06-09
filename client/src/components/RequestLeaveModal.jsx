import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useAuth } from '../context/useAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { pl } from 'date-fns/locale';

import {
    X,
    Calendar as CalendarIcon,
    Clock,
    Check,
    AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Select } from './ui/Select';

export default function RequestLeaveModal({ onClose, onSuccess }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        leaveType: 'vacation',
        startDate: null,
        endDate: null,
        reason: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setFormData((prev) => ({ ...prev, startDate: start, endDate: end }));
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

    const days = calculateDays();

    // Determine if reason is mandatory
    const isReasonRequired = () => {
        const optionalTypes = [
            'vacation',
            'on_demand',
            'maternity',
            'paternity',
            'parental',
        ];
        return !optionalTypes.includes(formData.leaveType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate) {
            setError(t('leaves.errors.dateRange') || 'Select a date range.');
            return;
        }

        if (isReasonRequired() && !formData.reason.trim()) {
            setError(
                t('leaves.errors.reasonRequired') ||
                    'A reason is required for this leave type.',
            );
            return;
        }

        const totalDays = calculateDays();

        if (totalDays <= 0) {
            setError(
                t('leaves.errors.noWorkingDays') ||
                    'No working days in the selected range.',
            );
            return;
        }

        if (!user || !user.company) {
            setError(
                t('leaves.errors.noCompany') ||
                    'No company data for the current user.',
            );
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/leaves', {
                ...formData,
                days: totalDays,
                company: user.company._id,
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString(),
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating leave request:', err);
            setError(
                err.response?.data?.message ||
                    t('leaves.errors.submitError') ||
                    'Error submitting request',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="animate-in fade-in absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
                onClick={onClose}
            />

            <div className="animate-in zoom-in-95 relative w-full max-w-lg scale-100 overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] transition-all duration-300 dark:border-white/5 dark:bg-zinc-900 dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-black/5 p-8 dark:border-white/5 sm:p-10">
                    <div className="absolute -left-4 -top-4 rounded-full bg-primary/10 p-12 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                            {t('leaves.myLeaves.newRequest')}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {t('leaves.myLeaves.modalSubtitle') ||
                                'Fill out the form to submit a leave request'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-muted-foreground transition-all hover:bg-black/10 hover:text-foreground active:scale-95 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="relative z-10 space-y-8 p-8 sm:p-10"
                >
                    {error && (
                        <div className="animate-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-rose-500/10 bg-rose-500/5 px-4 py-3 text-sm font-bold text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Leave Type */}
                        <div className="group space-y-2">
                            <label
                                htmlFor="leave-type"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors group-focus-within:text-primary"
                            >
                                {t('common.type')}
                            </label>
                            <div className="relative">
                                <Select
                                    id="leave-type"
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                >
                                    <optgroup
                                        label={
                                            t('leaves.types.groups.basic') ||
                                            'Basic'
                                        }
                                    >
                                        <option value="vacation">
                                            {t('leaves.types.vacation') ||
                                                'Annual leave'}
                                        </option>
                                        <option value="on_demand">
                                            {t('leaves.types.on_demand') ||
                                                'On-demand leave'}
                                        </option>
                                        <option value="sick">
                                            {t('leaves.types.sick') ||
                                                'Sick leave'}
                                        </option>
                                    </optgroup>
                                    <optgroup
                                        label={
                                            t('leaves.types.groups.parental') ||
                                            'Parental'
                                        }
                                    >
                                        <option value="maternity">
                                            {t('leaves.types.maternity') ||
                                                'Maternity leave'}
                                        </option>
                                        <option value="paternity">
                                            {t('leaves.types.paternity') ||
                                                'Paternity leave'}
                                        </option>
                                        <option value="parental">
                                            {t('leaves.types.parental') ||
                                                'Parental leave'}
                                        </option>
                                        <option value="childcare">
                                            {t('leaves.types.childcare') ||
                                                'Childcare leave'}
                                        </option>
                                    </optgroup>
                                    <optgroup
                                        label={
                                            t('leaves.types.groups.other') ||
                                            'Other'
                                        }
                                    >
                                        <option value="occasional">
                                            {t('leaves.types.occasional') ||
                                                'Occasional leave'}
                                        </option>
                                        <option value="care">
                                            {t('leaves.types.care') ||
                                                'Care leave'}
                                        </option>
                                        <option value="training">
                                            {t('leaves.types.training') ||
                                                'Training leave'}
                                        </option>
                                        <option value="unpaid">
                                            {t('leaves.types.unpaid') ||
                                                'Unpaid leave'}
                                        </option>
                                        <option value="job_search">
                                            {t('leaves.types.job_search') ||
                                                'Job search'}
                                        </option>
                                        <option value="health">
                                            {t('leaves.types.health') ||
                                                'Health/Rehabilitation'}
                                        </option>
                                        <option value="other">
                                            {t('leaves.types.other') || 'Other'}
                                        </option>
                                    </optgroup>
                                </Select>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors group-focus-within:text-primary">
                                {t('common.dates')}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <div suppressHydrationWarning className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-muted-foreground">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <DatePicker
                                    inputId="leave-dates"
                                    selectsRange={true}
                                    startDate={formData.startDate}
                                    endDate={formData.endDate}
                                    onChange={handleDateChange}
                                    locale={pl}
                                    dateFormat="dd/MM/yyyy"
                                    minDate={new Date()}
                                    placeholderText={
                                        t(
                                            'leaves.myLeaves.dateRangePlaceholder',
                                        ) || 'Select a date range'
                                    }
                                    className="w-full rounded-2xl border border-black/5 bg-black/5 py-4 pl-12 pr-4 font-bold text-foreground outline-none transition-all focus:border-primary/50 focus:bg-black/[0.08] dark:border-white/5 dark:bg-white/5 dark:focus:bg-white/[0.08]"
                                    wrapperClassName="w-full"
                                />
                            </div>
                        </div>

                        {/* Duration Banner */}
                        <div
                            className={clsx(
                                'overflow-hidden transition-all duration-500',
                                days > 0
                                    ? 'max-h-20 opacity-100'
                                    : 'max-h-0 opacity-0',
                            )}
                        >
                            <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-primary">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 stroke-[3]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {t('leaves.myLeaves.duration') ||
                                            'Duration'}
                                    </span>
                                </div>
                                <span className="text-lg font-black italic">
                                    {days}{' '}
                                    {days === 1
                                        ? t('leaves.myLeaves.workingDay') ||
                                          'working day'
                                        : t('leaves.myLeaves.workingDays') ||
                                          'working days'}
                                </span>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="group space-y-2">
                            <label
                                htmlFor="leave-reason"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors group-focus-within:text-primary"
                            >
                                {t('common.reason')}{' '}
                                {isReasonRequired() && (
                                    <span className="text-rose-500">*</span>
                                )}
                            </label>
                            <textarea
                                id="leave-reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="3"
                                className="w-full resize-none rounded-2xl border border-black/5 bg-black/5 px-4 py-4 font-medium text-foreground outline-none transition-all placeholder:text-zinc-400 focus:border-primary/50 focus:bg-black/[0.08] dark:border-white/5 dark:bg-white/5 dark:placeholder:text-zinc-600 dark:focus:bg-white/[0.08]"
                                placeholder={
                                    isReasonRequired()
                                        ? t(
                                              'leaves.myLeaves.reasonRequiredPlaceholder',
                                          ) ||
                                          'Describe the reason (required)...'
                                        : t(
                                              'leaves.myLeaves.reasonOptionalPlaceholder',
                                          ) ||
                                          'Additional information (optional)...'
                                }
                                required={isReasonRequired()}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                            disabled={loading}
                        >
                            {t('common.cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
                                    <span className="text-xs uppercase tracking-widest text-black">
                                        {t('common.processing') ||
                                            'Processing...'}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs uppercase tracking-widest text-black">
                                    {t('leaves.myLeaves.submit') ||
                                        'Submit request'}
                                </span>
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
