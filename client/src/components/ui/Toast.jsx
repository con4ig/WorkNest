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
                    'flex items-center gap-3 rounded-md border px-4 py-3 shadow-lg',
                    type === 'success'
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-destructive/20 bg-destructive/10 text-destructive',
                )}
            >
                {type === 'success' ? (
                    <Check className="h-5 w-5 text-primary" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className={cn(
                        'ml-2 rounded-full p-1 transition-colors',
                        type === 'success'
                            ? 'text-primary hover:bg-primary/20'
                            : 'text-destructive hover:bg-destructive/20',
                    )}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
