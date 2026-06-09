import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useTranslation } from 'react-i18next';

import LoadingScreen from '../components/LoadingScreen';
import { formatDateForInput } from '../components/employees/details/UserHelpers';
import UserSidebar from '../components/employees/details/UserSidebar';
import UserHeader from '../components/employees/details/UserHeader';
import UserContactCard from '../components/employees/details/UserContactCard';
import UserProfessionalCard from '../components/employees/details/UserProfessionalCard';
import UserAddressCard from '../components/employees/details/UserAddressCard';
import UserPersonalCard from '../components/employees/details/UserPersonalCard';
import UserNotesCard from '../components/employees/details/UserNotesCard';
import UserEmploymentHistoryCard from '../components/employees/details/UserEmploymentHistoryCard';
import UserDocumentsCard from '../components/employees/details/UserDocumentsCard';

export default function UserDetails() {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [employmentHistory, setEmploymentHistory] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const meRes = await api.get('/users/me');
            setCurrentUser(meRes.data);

            const res = await api.get(`/users/${id}`);

            // Set default values for HR fields if missing
            const userData = {
                username: res.data.username || '',
                email: res.data.email || '',
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                phoneNumber: res.data.phoneNumber || '',
                position: res.data.position || '',
                department: res.data.department || '',
                hireDate: formatDateForInput(res.data.hireDate || ''),
                salary: res.data.salary || 0,
                status: res.data.status || 'active',
                contractType: res.data.contractType || 'full-time',
                role: res.data.role || 'employee',
                address: res.data.address || '',
                city: res.data.city || '',
                peselOrId: res.data.peselOrId || '',
                notes: res.data.notes || '',
                employmentHistory: res.data.employmentHistory || [],
                documents: res.data.documents || [],
            };

            setUser(res.data);
            setEditData(userData);
            setEmploymentHistory(res.data.employmentHistory || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(`Failed to load employee data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        id && fetchData();
    }, [id, fetchData]);

    const handleEditChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;
        if (type === 'number') newValue = parseInt(value, 10) || 0;
        setEditData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleHistoryChange = (index, e) => {
        const { name, value } = e.target;
        const updatedHistory = [...editData.employmentHistory];
        updatedHistory[index] = { ...updatedHistory[index], [name]: value };
        setEditData((prev) => ({ ...prev, employmentHistory: updatedHistory }));
    };

    const handleAddHistory = () => {
        const newHistoryEntry = {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: '',
        };
        setEditData((prev) => ({
            ...prev,
            employmentHistory: [...prev.employmentHistory, newHistoryEntry],
        }));
    };

    const handleRemoveHistory = (index) => {
        const updatedHistory = editData.employmentHistory.filter(
            (_, i) => i !== index,
        );
        setEditData((prev) => ({ ...prev, employmentHistory: updatedHistory }));
    };

    const handleDocumentChange = (index, e) => {
        const { name, value } = e.target;
        const updatedDocuments = [...editData.documents];
        updatedDocuments[index] = { ...updatedDocuments[index], [name]: value };
        setEditData((prev) => ({ ...prev, documents: updatedDocuments }));
    };

    const handleAddDocument = () => {
        const newDocument = {
            name: '',
            url: '',
            category: 'documentation',
            uploadedAt: new Date().toISOString(),
        };
        setEditData((prev) => ({
            ...prev,
            documents: [...(prev.documents || []), newDocument],
        }));
    };

    const handleRemoveDocument = (index) => {
        const updatedDocuments = editData.documents.filter(
            (_, i) => i !== index,
        );
        setEditData((prev) => ({ ...prev, documents: updatedDocuments }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { ...editData };

            // Filter empty entries
            if (dataToSave.documents) {
                dataToSave.documents = dataToSave.documents.filter(
                    (doc) => doc.name && doc.url,
                );
            }
            if (dataToSave.employmentHistory) {
                dataToSave.employmentHistory =
                    dataToSave.employmentHistory.filter(
                        (hist) => hist.company && hist.position,
                    );
            }

            const response = await api.patch(`/users/${id}`, {
                ...dataToSave,
                hireDate: dataToSave.hireDate || null,
                salary: dataToSave.salary || 0,
            });

            const updatedUser = response.data.user;

            setUser(updatedUser);
            setEmploymentHistory(updatedUser.employmentHistory || []);

            const userData = {
                username: updatedUser.username || '',
                email: updatedUser.email || '',
                firstName: updatedUser.firstName || '',
                lastName: updatedUser.lastName || '',
                phoneNumber: updatedUser.phoneNumber || '',
                position: updatedUser.position || '',
                department: updatedUser.department || '',
                hireDate: formatDateForInput(updatedUser.hireDate || ''),
                salary: updatedUser.salary || 0,
                status: updatedUser.status || 'active',
                contractType: updatedUser.contractType || 'full-time',
                role: updatedUser.role || 'employee',
                address: updatedUser.address || '',
                city: updatedUser.city || '',
                peselOrId: updatedUser.peselOrId || '',
                notes: updatedUser.notes || '',
                employmentHistory: updatedUser.employmentHistory || [],
                documents: updatedUser.documents || [],
            };
            setEditData(userData);
            setIsEditing(false);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || t('common.errors.unexpected');
            alert(`${t('common.errors.saveFailed')}: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading)
        return <LoadingScreen message={t('employees.loadingDetails')} />;

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
                <div className="w-full max-w-lg rounded-xl border border-destructive/50 bg-destructive/10 px-8 py-6 text-destructive shadow-lg">
                    <strong className="mb-2 block text-lg font-bold">
                        {t('common.error')}
                    </strong>
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => navigate('/employees')}
                        className="mt-6 w-full rounded-lg bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
                    >
                        {t('common.back')}
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isHR = currentUser?.role === 'hr';
    const isSuperAdmin = currentUser?.role === 'superadmin';
    const isAdmin =
        currentUser?.role === 'admin' ||
        isSuperAdmin ||
        (isHR && user.role !== 'admin' && user.role !== 'superadmin');
    const fullName =
        `${editData.firstName} ${editData.lastName}`.trim() ||
        editData.username;

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground lg:flex-row">
            <UserSidebar
                user={user}
                editData={editData}
                isEditing={isEditing}
                handleEditChange={handleEditChange}
                t={t}
                i18n={i18n}
                navigate={navigate}
                fullName={fullName}
            />

            <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
                <div className="space-y-10">
                    <UserHeader
                        isAdmin={isAdmin}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        isSaving={isSaving}
                        handleSave={handleSave}
                        editData={editData}
                        handleEditChange={handleEditChange}
                        fullName={fullName}
                        fetchData={fetchData}
                        t={t}
                    />

                    <div className="space-y-8 pb-20">
                        <UserContactCard
                            isEditing={isEditing}
                            editData={editData}
                            user={user}
                            handleEditChange={handleEditChange}
                            t={t}
                        />

                        <UserProfessionalCard
                            isEditing={isEditing}
                            editData={editData}
                            user={user}
                            handleEditChange={handleEditChange}
                            t={t}
                            i18n={i18n}
                        />

                        <UserAddressCard
                            isEditing={isEditing}
                            editData={editData}
                            user={user}
                            handleEditChange={handleEditChange}
                            t={t}
                        />

                        <UserPersonalCard
                            isEditing={isEditing}
                            editData={editData}
                            user={user}
                            handleEditChange={handleEditChange}
                            t={t}
                        />

                        <UserNotesCard
                            isEditing={isEditing}
                            editData={editData}
                            user={user}
                            handleEditChange={handleEditChange}
                            t={t}
                        />

                        <UserEmploymentHistoryCard
                            isEditing={isEditing}
                            editData={editData}
                            employmentHistory={employmentHistory}
                            handleHistoryChange={handleHistoryChange}
                            handleAddHistory={handleAddHistory}
                            handleRemoveHistory={handleRemoveHistory}
                            t={t}
                        />

                        <UserDocumentsCard
                            isEditing={isEditing}
                            editData={editData}
                            user={user}
                            handleDocumentChange={handleDocumentChange}
                            handleAddDocument={handleAddDocument}
                            handleRemoveDocument={handleRemoveDocument}
                            t={t}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
