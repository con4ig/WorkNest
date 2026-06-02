import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const Select = React.forwardRef(
    (
        { className, children, value, onChange, disabled, name, id, ...props },
        ref,
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const containerRef = React.useRef(null);
        const selectRef = React.useRef(null);

        const combinedRef = (node) => {
            selectRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
        };

        const parsedOptions = [];
        React.Children.forEach(children, (child) => {
            if (!React.isValidElement(child)) return;
            if (child.type === 'optgroup') {
                const groupOpts = [];
                React.Children.forEach(child.props.children, (opt) => {
                    if (React.isValidElement(opt) && opt.type === 'option') {
                        groupOpts.push({
                            value: opt.props.value,
                            label: opt.props.children,
                        });
                    }
                });
                if (groupOpts.length > 0) {
                    parsedOptions.push({
                        isGroup: true,
                        label: child.props.label,
                        options: groupOpts,
                    });
                }
            } else if (child.type === 'option') {
                parsedOptions.push({
                    isGroup: false,
                    value: child.props.value,
                    label: child.props.children,
                });
            }
        });

        React.useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target)
                ) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
                document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handleSelect = (selectedValue) => {
            if (disabled) return;
            setIsOpen(false);

            if (
                selectRef.current &&
                selectRef.current.value !== selectedValue
            ) {
                selectRef.current.value = selectedValue;
                const event = new Event('change', { bubbles: true });
                selectRef.current.dispatchEvent(event);
            }

            if (onChange) {
                onChange({
                    target: { name, value: selectedValue },
                    currentTarget: { name, value: selectedValue },
                    preventDefault: () => {},
                    stopPropagation: () => {},
                });
            }
        };

        let selectedLabel = '';
        parsedOptions.forEach((opt) => {
            if (opt.isGroup) {
                opt.options.forEach((subOpt) => {
                    if (String(subOpt.value) === String(value))
                        selectedLabel = subOpt.label;
                });
            } else {
                if (String(opt.value) === String(value))
                    selectedLabel = opt.label;
            }
        });

        return (
            <div className="relative w-full" ref={containerRef}>
                <select
                    className="hidden"
                    value={value}
                    onChange={onChange}
                    name={name}
                    id={id}
                    ref={combinedRef}
                    disabled={disabled}
                    {...props}
                >
                    {children}
                </select>

                <div
                    className={cn(
                        'flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                        disabled && 'cursor-not-allowed opacity-50',
                        className,
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) setIsOpen(!isOpen);
                        } else if (e.key === 'Escape') {
                            setIsOpen(false);
                        }
                    }}
                >
                    <span className="block truncate">
                        {selectedLabel || 'Select...'}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>

                {isOpen && (
                    <div className="animate-in fade-in zoom-in-95 absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 text-base shadow-md focus:outline-none sm:text-sm">
                        {parsedOptions.map((opt, i) => {
                            if (opt.isGroup) {
                                return (
                                    <div key={i}>
                                        <div className="bg-muted/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {opt.label}
                                        </div>
                                        {opt.options.map((subOpt) => (
                                            <div
                                                key={subOpt.value}
                                                className={cn(
                                                    'relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                                                    String(value) ===
                                                        String(subOpt.value) &&
                                                        'bg-accent/50 font-medium text-accent-foreground',
                                                )}
                                                onClick={() =>
                                                    handleSelect(subOpt.value)
                                                }
                                            >
                                                {String(value) ===
                                                    String(subOpt.value) && (
                                                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-primary">
                                                        <Check className="h-4 w-4" />
                                                    </span>
                                                )}
                                                <span className="block truncate">
                                                    {subOpt.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={opt.value}
                                        className={cn(
                                            'relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                                            String(value) ===
                                                String(opt.value) &&
                                                'bg-accent/50 font-medium text-accent-foreground',
                                        )}
                                        onClick={() => handleSelect(opt.value)}
                                    >
                                        {String(value) ===
                                            String(opt.value) && (
                                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-primary">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                        <span className="block truncate">
                                            {opt.label}
                                        </span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        );
    },
);
Select.displayName = 'Select';

export { Select };
