import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

const CodeHeader = ({ navigate, t }) => {
    return (
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
            <div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                        className="mr-2 md:hidden"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        {t('generateCode.title')}
                    </h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t('generateCode.subtitle')}
                </p>
            </div>
        </div>
    );
};

export default CodeHeader;
