import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="animate-slide-up fixed bottom-4 right-4 z-50">
            <div
                className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
                    type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-red-200 bg-red-50 text-red-900',
                )}
            >
                {type === 'success' ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className={cn(
                        'ml-2 rounded-full p-1 transition-colors',
                        type === 'success'
                            ? 'text-emerald-700 hover:bg-emerald-100'
                            : 'text-red-700 hover:bg-red-100',
                    )}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
