import React from 'react';
import {
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Calendar,
    SquarePen,
    Save,
    X,
    ArrowLeft,
    FileText,
    Building2,
    Badge,
} from 'lucide-react';

export const Icon = {
    Mail: ({ className = '' }) => <Mail className={`h-5 w-5 ${className}`} />,
    Phone: ({ className = '' }) => <Phone className={`h-5 w-5 ${className}`} />,
    Briefcase: ({ className = '' }) => (
        <Briefcase className={`h-5 w-5 ${className}`} />
    ),
    Building: ({ className = '' }) => (
        <Building2 className={`h-5 w-5 ${className}`} />
    ),
    Location: ({ className = '' }) => (
        <MapPin className={`h-5 w-5 ${className}`} />
    ),
    Calendar: ({ className = '' }) => (
        <Calendar className={`h-5 w-5 ${className}`} />
    ),
    Edit: () => <SquarePen className="h-4 w-4" />,
    Save: () => <Save className="h-4 w-4" />,
    Cancel: () => <X className="h-4 w-4" />,
    Back: () => <ArrowLeft className="h-4 w-4" />,
    Badge: ({ className = '' }) => <Badge className={`h-5 w-5 ${className}`} />,
    Notes: ({ className = '' }) => (
        <FileText className={`h-5 w-5 ${className}`} />
    ),
    Documents: ({ className = '' }) => (
        <FileText className={`h-5 w-5 ${className}`} />
    ),
};
