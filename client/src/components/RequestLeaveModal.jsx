import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useAuth } from '../context/useAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { pl, enUS } from 'date-fns/locale';

import { X, Calendar as CalendarIcon, Check, AlertCircle } from 'lucide-react';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

export default function RequestLeaveModal({ isOpen, onClose, onSuccess }) {
    const { t, i18n } = useTranslation();
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
            setError(t('leaves.errors.dateRange'));
            return;
        }

        if (isReasonRequired() && !formData.reason.trim()) {
            setError(t('leaves.errors.reasonRequired'));
            return;
        }

        const totalDays = calculateDays();

        if (totalDays <= 0) {
            setError(t('leaves.errors.noWorkingDays'));
            return;
        }

        if (!user || !user.company) {
            setError(t('leaves.errors.noCompany'));
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

    if (!isOpen) return null;

    const dateLocale = i18n.language.startsWith('pl') ? pl : enUS;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="animate-in zoom-in-95 fade-in relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-xl duration-200">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between border-b border-border px-5 pb-4 pt-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                            <CalendarIcon size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold leading-snug text-foreground">
                                {t('leaves.myLeaves.newRequest')}
                            </h2>
                            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                                {t('leaves.myLeaves.modalSubtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                    <div className="space-y-6 px-5 py-5">
                        {error && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                                <span className="text-xs font-medium">
                                    {error}
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Leave Type */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="leave-type"
                                    className="block text-sm font-semibold text-foreground"
                                >
                                    {t('common.type')}
                                </label>
                                <Select
                                    id="leave-type"
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                >
                                    <optgroup
                                        label={
                                            t('leaves.myLeaves.groups.basic') ||
                                            'Basic'
                                        }
                                    >
                                        <option value="vacation">
                                            {t('common.leaveType.vacation') ||
                                                'Annual leave'}
                                        </option>
                                        <option value="on_demand">
                                            {t('common.leaveType.on_demand') ||
                                                'On-demand leave'}
                                        </option>
                                        <option value="sick">
                                            {t('common.leaveType.sick') ||
                                                'Sick leave'}
                                        </option>
                                    </optgroup>
                                    <optgroup
                                        label={
                                            t(
                                                'leaves.myLeaves.groups.parental',
                                            ) || 'Parental'
                                        }
                                    >
                                        <option value="maternity">
                                            {t('common.leaveType.maternity') ||
                                                'Maternity leave'}
                                        </option>
                                        <option value="paternity">
                                            {t('common.leaveType.paternity') ||
                                                'Paternity leave'}
                                        </option>
                                        <option value="parental">
                                            {t('common.leaveType.parental') ||
                                                'Parental leave'}
                                        </option>
                                        <option value="childcare">
                                            {t('common.leaveType.childcare') ||
                                                'Childcare leave'}
                                        </option>
                                    </optgroup>
                                    <optgroup
                                        label={
                                            t('leaves.myLeaves.groups.other') ||
                                            'Other'
                                        }
                                    >
                                        <option value="occasional">
                                            {t('common.leaveType.occasional') ||
                                                'Occasional leave'}
                                        </option>
                                        <option value="care">
                                            {t('common.leaveType.care') ||
                                                'Care leave'}
                                        </option>
                                        <option value="training">
                                            {t('common.leaveType.training') ||
                                                'Training leave'}
                                        </option>
                                        <option value="unpaid">
                                            {t('common.leaveType.unpaid') ||
                                                'Unpaid leave'}
                                        </option>
                                        <option value="job_search">
                                            {t('common.leaveType.job_search') ||
                                                'Job search'}
                                        </option>
                                        <option value="health">
                                            {t('common.leaveType.health') ||
                                                'Health/Rehabilitation'}
                                        </option>
                                        <option value="other">
                                            {t('common.leaveType.other') ||
                                                'Other'}
                                        </option>
                                    </optgroup>
                                </Select>
                            </div>

                            {/* Date Picker */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="leave-dates"
                                    className="block text-sm font-semibold text-foreground"
                                >
                                    {t('common.dates')}{' '}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div
                                    suppressHydrationWarning
                                    className="relative"
                                >
                                    <div className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4" />
                                    </div>
                                    <DatePicker
                                        id="leave-dates"
                                        inputId="leave-dates"
                                        selectsRange={true}
                                        startDate={formData.startDate}
                                        endDate={formData.endDate}
                                        onChange={handleDateChange}
                                        locale={dateLocale}
                                        dateFormat="dd/MM/yyyy"
                                        minDate={new Date()}
                                        placeholderText={t(
                                            'leaves.myLeaves.dateRangePlaceholder',
                                        )}
                                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>

                            {/* Duration Banner */}
                            {days > 0 && (
                                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Check className="h-4 w-4 stroke-[3]" />
                                        <span>
                                            {t('leaves.myLeaves.duration')}
                                        </span>
                                    </div>
                                    <span className="font-bold">
                                        {days}{' '}
                                        {days === 1
                                            ? t('leaves.myLeaves.workingDay')
                                            : t('leaves.myLeaves.workingDays')}
                                    </span>
                                </div>
                            )}

                            {/* Reason */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="leave-reason"
                                    className="block text-sm font-semibold text-foreground"
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
                                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder={
                                        isReasonRequired()
                                            ? t(
                                                  'leaves.myLeaves.reasonRequiredPlaceholder',
                                              )
                                            : t(
                                                  'leaves.myLeaves.reasonOptionalPlaceholder',
                                              )
                                    }
                                    required={isReasonRequired()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            isLoading={loading}
                        >
                            {t('leaves.myLeaves.submit')}
                        </Button>
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
