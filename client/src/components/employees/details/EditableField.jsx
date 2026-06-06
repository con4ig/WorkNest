import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '../../ui/Select';

const EditableField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    disabled,
    options,
}) => {
    const { t } = useTranslation();
    const inputClasses =
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/40';

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={`field-${name}`}
                className="ml-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
                {label}
            </label>
            {options ? (
                <Select
                    id={`field-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    <option value="">-- {t('common.select')} --</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {name === 'role'
                                ? t(`common.roles.${opt}`)
                                : name === 'department'
                                  ? t(`common.departments.${opt}`)
                                  : opt}
                        </option>
                    ))}
                </Select>
            ) : type === 'textarea' ? (
                <textarea
                    id={`field-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    rows={4}
                    className={inputClasses}
                    aria-label={label}
                />
            ) : (
                <input
                    id={`field-${name}`}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={inputClasses}
                    aria-label={label}
                />
            )}
        </div>
    );
};

export default EditableField;
