import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen.jsx';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/useAuth';

import CodeHeader from '../components/codes/CodeHeader';
import CodeStats from '../components/codes/CodeStats';
import CodeGeneratorForm from '../components/codes/CodeGeneratorForm';
import CodeList from '../components/codes/CodeList';
import DemoWarningModal from '../components/codes/DemoWarningModal';

export default function GenerateCode() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState(true);
    const [invitations, setInvitations] = useState([]);
    const { user: currentUser } = useAuth();
    const [showDemoWarning, setShowDemoWarning] = useState(false);

    const [confirmationProps, setConfirmationProps] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const askForConfirmation = (props) => {
        setConfirmationProps({ isOpen: true, ...props });
    };

    // Form state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        role: 'employee',
        type: 'single', // 'single' or 'multi'
        maxUses: 5,
        expiresIn: '5m', // 5 minut default
    });

    // Copy feedback state
    const [copiedId, setCopiedId] = useState(null);

    const fetchInvitations = useCallback(async () => {
        try {
            const res = await api.get('/users/invitations');
            const sorted = res.data.sort((a, b) => {
                const aExpired = new Date(a.expiresAt) < new Date();
                const bExpired = new Date(b.expiresAt) < new Date();
                if (aExpired === bExpired) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return aExpired ? 1 : -1;
            });
            setInvitations(sorted);
        } catch (err) {
            console.error('Error fetching invitations:', err);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchInvitations();
            setPageLoading(false);
        };
        init();
    }, [fetchInvitations]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                role: formData.role,
                expiresIn: formData.expiresIn,
                maxUses: formData.type === 'single' ? 1 : formData.maxUses || 2,
            };

            await api.post('/users/generate-invitation', payload);
            await fetchInvitations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    t('generateCode.generateError') ||
                    'Error generating code',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = (id) => {
        askForConfirmation({
            title: t('generateCode.revokeCode'),
            message: t('generateCode.revokeConfirm'),
            confirmText: t('common.delete'),
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/users/invitations/${id}`);
                    await fetchInvitations();
                    toast.success(
                        t('generateCode.revokeSuccess') || 'Code revoked',
                    );
                } catch (err) {
                    toast.error(t('generateCode.revokeError'));
                }
            },
        });
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (pageLoading)
        return <LoadingScreen message={t('generateCode.loading')} />;

    return (
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />

            <CodeHeader navigate={navigate} t={t} />

            <CodeStats invitations={invitations} t={t} />

            <div className="grid gap-6 lg:grid-cols-12">
                <CodeGeneratorForm
                    formData={formData}
                    setFormData={setFormData}
                    loading={loading}
                    error={error}
                    handleGenerate={handleGenerate}
                    currentUser={currentUser}
                    setShowDemoWarning={setShowDemoWarning}
                    t={t}
                />

                <CodeList
                    invitations={invitations}
                    copiedId={copiedId}
                    copyToClipboard={copyToClipboard}
                    handleRevoke={handleRevoke}
                    t={t}
                    i18n={i18n}
                />
            </div>

            <DemoWarningModal
                showDemoWarning={showDemoWarning}
                setShowDemoWarning={setShowDemoWarning}
                handleGenerate={handleGenerate}
                t={t}
            />
        </div>
    );
}
