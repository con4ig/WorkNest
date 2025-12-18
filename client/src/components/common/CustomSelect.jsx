import { Listbox, Transition, Portal } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { Fragment } from 'react';

export default function CustomSelect({ options, selected, onChange, placeholder = "Wybierz opcję" }) {
    // Find the full selected object from the options array based on the selected value
    const selectedOption = options.find(option => option.id === selected) || null;

    return (
        <Listbox value={selected} onChange={onChange}>
            <div className="relative">
                <Listbox.Button className="relative cursor-default rounded-full border border-gray-300 bg-gray-50 py-1 pl-3 pr-10 text-left text-xs transition-colors hover:border-emerald-500 focus:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-300">
                    <span className="block truncate">{selectedOption ? selectedOption.name : <span className="text-gray-500">{placeholder}</span>}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown
                            className="h-4 w-4 text-gray-400"
                            aria-hidden="true"
                        />
                    </span>
                </Listbox.Button>
                <Portal>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-auto min-w-max overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-emerald-100 text-emerald-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={option.id}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block ${
                                                    selected ? 'font-medium' : 'font-normal'
                                                }`}
                                            >
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                                                    <Check className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </Portal>
            </div>
        </Listbox>
    );
}
