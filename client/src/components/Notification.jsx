import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
};

const Notification = ({ notification, onClear }) => {
    const { message, type, visible } = notification;

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClear();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClear]);

    if (!visible) return null;

    const baseClasses = "fixed top-24 right-5 z-[100] p-4 rounded-lg shadow-2xl flex items-center transition-all duration-300 transform";
    const typeClasses = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
    };
    
    // Animation classes
    const animationClass = visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info} ${animationClass}`}>
            <div className="flex-shrink-0">
                {icons[type] || icons.info}
            </div>
            <span className="ml-3 font-medium">{message}</span>
            <button onClick={onClear} className="ml-4 -mr-2 p-1 rounded-full transition-colors hover:bg-white/20">
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Notification;
