import React from 'react';
import {
    Calendar,
    User,
    SquarePen,
    Save,
    X,
    ArrowLeft,
    Users,
    Info,
    CheckCircle2,
    Circle,
    Clock,
    MessageSquare,
    Activity as ActivityIcon,
    Plus,
    Trash2,
    Edit3,
    Send,
    ChevronDown,
    ChevronRight,
    ListTodo,
} from 'lucide-react';

export const Icon = {
    Calendar: ({ className = 'text-emerald-500' }) => (
        <Calendar className={`h-6 w-6 ${className}`} />
    ),
    User: ({ className }) => <User className={`h-5 w-5 ${className}`} />,
    Edit: () => <SquarePen className="h-5 w-5" />,
    Save: () => <Save className="h-5 w-5" />,
    Cancel: () => <X className="h-5 w-5" />,
    Back: () => <ArrowLeft className="h-5 w-5" />,
    Users: ({ className = 'text-emerald-500' }) => (
        <Users className={`h-6 w-6 ${className}`} />
    ),
    Info: ({ className = 'text-emerald-500' }) => (
        <Info className={`h-6 w-6 ${className}`} />
    ),
    CheckCircle: ({ className }) => (
        <CheckCircle2 className={`h-5 w-5 ${className}`} />
    ),
    Circle: ({ className }) => <Circle className={`h-5 w-5 ${className}`} />,
    Clock: ({ className }) => <Clock className={`h-5 w-5 ${className}`} />,
    Message: ({ className = 'text-emerald-500' }) => (
        <MessageSquare className={`h-6 w-6 ${className}`} />
    ),
    Activity: ({ className = 'text-emerald-500' }) => (
        <ActivityIcon className={`h-6 w-6 ${className}`} />
    ),
    Plus: () => <Plus className="h-4 w-4" />,
    Trash: () => <Trash2 className="h-4 w-4" />,
    Edit3: () => <Edit3 className="h-4 w-4" />,
    Send: () => <Send className="h-4 w-4" />,
    ChevronDown: () => <ChevronDown className="h-4 w-4" />,
    ChevronRight: () => <ChevronRight className="h-4 w-4" />,
    ListTodo: ({ className = 'text-emerald-500' }) => (
        <ListTodo className={`h-6 w-6 ${className}`} />
    ),
};

export const getStatusClasses = (status) => {
    switch (status) {
        case 'running':
        case 'in-progress':
            return 'bg-sky-100 text-sky-800 ring-sky-300/50';
        case 'completed':
            return 'bg-green-100 text-green-800 ring-green-300/50';
        case 'on-hold':
            return 'bg-amber-100 text-amber-800 ring-amber-300/50';
        case 'todo':
            return 'bg-slate-100 text-slate-800 ring-slate-300/50';
        default:
            return 'bg-slate-100 text-slate-800 ring-slate-300/50';
    }
};

export const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'critical':
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-amber-100 text-amber-800';
        default:
            return 'bg-green-100 text-green-800';
    }
};

export const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
        return '';
    }
};

export const AVAILABLE_PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const TASK_STATUSES = ['todo', 'in-progress', 'completed'];
export const AVAILABLE_STATUSES = ['pending', 'running', 'on-hold', 'completed'];
