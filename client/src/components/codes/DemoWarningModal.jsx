import React from 'react';
import { Shield, Check, Trash2, Info } from 'lucide-react';
import { Button } from '../ui/Button';

const DemoWarningModal = ({
    showDemoWarning,
    setShowDemoWarning,
    handleGenerate,
    t,
}) => {
    if (!showDemoWarning) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl duration-200">
                <div className="p-6">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            {t('generateCode.demoWarningTitle')}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('generateCode.demoWarningDesc')}{' '}
                            <span className="font-medium text-foreground">
                                {t('generateCode.demoWarningDescBold')}
                            </span>
                            .
                        </p>
                    </div>

                    <div className="mb-6 space-y-4">
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-3">
                                <div className="mt-0.5 text-primary">
                                    <Check className="h-4 w-4" />
                                </div>
                                {t('generateCode.demoPoint1')}{' '}
                                <strong className="font-semibold text-white">
                                    {t('generateCode.demoPoint1Bold')}
                                </strong>{' '}
                                {t('generateCode.demoPoint1End')}
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-0.5 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </div>
                                {t('generateCode.demoPoint2')}{' '}
                                <strong className="font-semibold text-white">
                                    {t('generateCode.demoPoint2Bold')}
                                </strong>
                                .
                            </li>
                        </ul>

                        <div className="flex gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                            <Info className="h-4 w-4 shrink-0 text-blue-500" />
                            <div>
                                <span className="mb-0.5 block font-semibold text-foreground">
                                    {t('generateCode.demoHintLabel')}
                                </span>
                                {t('generateCode.demoHint')}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => setShowDemoWarning(false)}
                        >
                            {t('generateCode.cancel')}
                        </Button>
                        <Button
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setShowDemoWarning(false);
                                handleGenerate();
                            }}
                        >
                            {t('generateCode.understand')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoWarningModal;
