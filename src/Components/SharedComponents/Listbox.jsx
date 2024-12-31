import React from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const CustomListbox = ({ value, onChange, options, label, t, translationPath }) => {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="space-y-2">
          <Listbox.Label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </Listbox.Label>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-slate-700 py-3 pl-3 pr-10 text-left text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm sm:leading-6">
              <span className="block truncate">
                {translationPath ? t(`${translationPath}.${value}`) : value}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className={({ active }) =>
                    classNames(
                      active ? 'bg-cyan-600 text-white' : 'text-slate-900 dark:text-slate-100',
                      'relative cursor-default select-none py-2 pl-3 pr-9'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                        {translationPath ? t(`${translationPath}.${option}`) : option}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </div>
      )}
    </Listbox>
  );
};

export default CustomListbox;
