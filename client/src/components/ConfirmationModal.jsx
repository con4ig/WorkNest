import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

    const confirmButtonClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        primary: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
    };

    const iconClasses = {
        danger: 'bg-red-100 text-red-500',
        primary: 'bg-emerald-100 text-emerald-500',
        warning: 'bg-yellow-100 text-yellow-500',
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
            <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all" onMouseDown={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-md transition-transform hover:scale-110 hover:text-slate-800"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconClasses[confirmVariant] || iconClasses.danger}`}>
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-800">{title}</h3>
                    <p className="text-base text-slate-500">{message}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        {cancelText || t('common.cancel')}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`rounded-lg py-3 px-4 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClasses[confirmVariant] || confirmButtonClasses.primary}`}
                    >
                        {confirmText || t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
