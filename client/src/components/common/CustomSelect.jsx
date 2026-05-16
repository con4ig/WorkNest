import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { Fragment } from 'react';

export default function CustomSelect({ options, selected, onChange, placeholder = "Select option" }) {
    const selectedOption = options.find(option => option.id === selected) || null;

    return (
        <Listbox value={selected} onChange={onChange}>
            <div className="relative">
                <Listbox.Button
                    className="relative w-full cursor-default rounded-full border border-border bg-card py-1 pl-3 pr-10 text-left text-xs text-foreground transition-colors hover:border-primary focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <span className="block truncate">{selectedOption ? selectedOption.name : <span className="text-muted-foreground">{placeholder}</span>}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                    </span>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute right-0 z-[100] mt-1 max-h-60 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border border-border bg-card py-1 text-sm text-foreground shadow-lg ring-1 ring-black/5 focus:outline-none">
                        {options.map((option) => (
                            <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-primary/10 text-primary' : 'text-foreground'
                                    }`
                                }
                                value={option.id}
                            >
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${
                                                selected ? 'font-medium' : 'font-normal'
                                            }`}
                                        >
                                            {option.name}
                                        </span>
                                        {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                <Check className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}
