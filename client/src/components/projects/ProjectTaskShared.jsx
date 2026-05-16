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
    Calendar: ({ className = 'text-primary' }) => (
        <Calendar className={`h-6 w-6 ${className}`} />
    ),
    User: ({ className }) => <User className={`h-5 w-5 ${className}`} />,
    Edit: () => <SquarePen className="h-5 w-5" />,
    Save: () => <Save className="h-5 w-5" />,
    Cancel: () => <X className="h-5 w-5" />,
    Back: () => <ArrowLeft className="h-5 w-5" />,
    Users: ({ className = 'text-primary' }) => (
        <Users className={`h-6 w-6 ${className}`} />
    ),
    Info: ({ className = 'text-primary' }) => (
        <Info className={`h-6 w-6 ${className}`} />
    ),
    CheckCircle: ({ className }) => (
        <CheckCircle2 className={`h-5 w-5 ${className}`} />
    ),
    Circle: ({ className }) => <Circle className={`h-5 w-5 ${className}`} />,
    Clock: ({ className }) => <Clock className={`h-5 w-5 ${className}`} />,
    Message: ({ className = 'text-primary' }) => (
        <MessageSquare className={`h-6 w-6 ${className}`} />
    ),
    Activity: ({ className = 'text-primary' }) => (
        <ActivityIcon className={`h-6 w-6 ${className}`} />
    ),
    Plus: () => <Plus className="h-4 w-4" />,
    Trash: () => <Trash2 className="h-4 w-4" />,
    Edit3: () => <Edit3 className="h-4 w-4" />,
    Send: () => <Send className="h-4 w-4" />,
    ChevronDown: () => <ChevronDown className="h-4 w-4" />,
    ChevronRight: () => <ChevronRight className="h-4 w-4" />,
    ListTodo: ({ className = 'text-primary' }) => (
        <ListTodo className={`h-6 w-6 ${className}`} />
    ),
    Status: ({ className = 'text-primary' }) => (
        <ActivityIcon className={`h-6 w-6 ${className}`} />
    ),
    Description: ({ className = 'text-primary' }) => (
        <Info className={`h-6 w-6 ${className}`} />
    ),
};

export const getStatusClasses = (_status) => {
    return 'bg-secondary/50 text-muted-foreground ring-1 ring-border';
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'running':
        case 'in-progress':
            return 'bg-blue-500';
        case 'completed':
            return 'bg-primary';
        case 'on-hold':
            return 'bg-amber-500';
        case 'todo':
            return 'bg-muted-foreground/30';
        default:
            return 'bg-muted-foreground/30';
    }
};

export const getPriorityClasses = (_priority) => {
    return 'bg-secondary/50 text-muted-foreground ring-1 ring-border';
};

export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'critical':
        case 'high':
            return 'bg-destructive';
        case 'medium':
            return 'bg-amber-500';
        default:
            return 'bg-primary';
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
