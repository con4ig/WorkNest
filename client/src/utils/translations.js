// Tłumaczenia wartości z bazy danych na polski

/**
 * Tłumaczy rolę użytkownika na polski
 */
export const translateRole = (role) => {
    const roleMap = {
        admin: 'Administrator',
        hr: 'HR',
        employee: 'Pracownik',
        superadmin: 'Superadmin',
    };
    return roleMap[role] || role;
};

/**
 * Tłumaczy status użytkownika na polski
 */
export const translateStatus = (status) => {
    const statusMap = {
        active: 'Aktywny',
        inactive: 'Nieaktywny',
        'on-leave': 'Na urlopie',
        terminated: 'Zwolniony',
    };
    return statusMap[status] || status;
};

/**
 * Tłumaczy typ kontraktu na polski
 */
export const translateContractType = (contractType) => {
    const contractMap = {
        'full-time': 'Pełny etat',
        'part-time': 'Część etatu',
        contract: 'Kontrakt',
        temporary: 'Tymczasowy',
    };
    return contractMap[contractType] || contractType;
};

/**
 * Tłumaczy status projektu na polski
 */
export const translateProjectStatus = (status) => {
    const statusMap = {
        pending: 'Oczekujący',
        running: 'W trakcie',
        completed: 'Zakończony',
        'on-hold': 'Wstrzymany',
    };
    return statusMap[status] || status;
};

/**
 * Tłumaczy status zadania na polski
 */
export const translateTaskStatus = (status) => {
    const statusMap = {
        todo: 'Do zrobienia',
        'in-progress': 'W trakcie',
        done: 'Zrobione',
    };
    return statusMap[status] || status;
};

/**
 * Tłumaczy priorytet na polski
 */
export const translatePriority = (priority) => {
    const priorityMap = {
        low: 'Niski',
        medium: 'Średni',
        high: 'Wysoki',
    };
    return priorityMap[priority] || priority;
};

/**
 * Tłumaczy status urlopu na polski
 */
export const translateLeaveStatus = (status) => {
    const statusMap = {
        pending: 'Oczekujący',
        approved: 'Zatwierdzony',
        rejected: 'Odrzucony',
    };
    return statusMap[status] || status;
};

/**
 * Tłumaczy typ urlopu na polski
 */
export const translateLeaveType = (type) => {
    const typeMap = {
        vacation: 'Urlop wypoczynkowy',
        sick: 'Zwolnienie lekarskie',
        personal: 'Urlop osobisty',
        other: 'Inny',
    };
    return typeMap[type] || type;
};
