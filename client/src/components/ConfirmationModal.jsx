import React from 'react';
import {
    X,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    Archive,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

const variants = {
    danger: {
        confirm:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        icon: AlertTriangle,
        iconClass: 'text-destructive',
    },
    primary: {
        confirm: 'bg-primary text-primary-foreground hover:bg-primary/90',
        icon: CheckCircle2,
        iconClass: 'text-primary',
    },
    warning: {
        confirm: 'bg-amber-500 text-white hover:bg-amber-600',
        icon: Archive,
        iconClass: 'text-amber-500',
    },
    info: {
        confirm: 'bg-blue-500 text-white hover:bg-blue-600',
        icon: Info,
        iconClass: 'text-blue-500',
    },
};

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

    const config = variants[confirmVariant] || variants.danger;
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="animate-in fade-in absolute inset-0 bg-foreground/25 backdrop-blur-sm transition-opacity duration-200"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="animate-in zoom-in-95 fade-in relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-xl duration-200">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Icon
                            size={18}
                            className={clsx('shrink-0', config.iconClass)}
                            aria-hidden="true"
                        />
                        <h2 className="text-base font-semibold leading-snug text-foreground">
                            {title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={t('common.close')}
                    >
                        <X size={15} aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                {message && (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {message}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                    >
                        {cancelText || t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={clsx(
                            'rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95',
                            config.confirm,
                        )}
                    >
                        {confirmText || t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
