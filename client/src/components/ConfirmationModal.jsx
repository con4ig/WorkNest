import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    confirmVariant = 'danger',
}) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const variants = {
        danger: {
            button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white',
            iconBg: 'bg-rose-500/10 text-rose-500',
            icon: AlertTriangle,
            glow: 'bg-rose-500/10'
        },
        primary: {
            button: 'bg-primary hover:bg-primary/90 shadow-primary/20 text-black',
            iconBg: 'bg-primary/10 text-primary',
            icon: CheckCircle2,
            glow: 'bg-primary/10'
        },
        warning: {
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-black',
            iconBg: 'bg-amber-500/10 text-amber-500',
            icon: AlertCircle,
            glow: 'bg-amber-500/10'
        },
        info: {
            button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 text-white',
            iconBg: 'bg-blue-500/10 text-blue-500',
            icon: Info,
            glow: 'bg-blue-500/10'
        }
    };

    const config = variants[confirmVariant] || variants.danger;
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-md scale-100 overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white active:scale-95"
                >
                    <X size={20} />
                </button>

                <div className="relative p-8 sm:p-10">
                    {/* Background Glow */}
                    <div className={clsx("absolute -left-4 -top-4 rounded-full p-20 blur-3xl opacity-50 dark:opacity-50", config.glow)} />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={clsx("mb-6 flex h-20 w-20 items-center justify-center rounded-3xl", config.iconBg)}>
                            <Icon className="h-10 w-10 stroke-[1.5]" />
                        </div>
                        <h3 className="mb-3 text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{title}</h3>
                        <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">{message}</p>
                    </div>

                    <div className="relative z-10 mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            onClick={onClose}
                            className="rounded-2xl bg-black/5 dark:bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
                        >
                            {cancelText || t('common.cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={clsx(
                                "flex items-center justify-center rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95",
                                config.button
                            )}
                        >
                            {confirmText || t('common.confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
