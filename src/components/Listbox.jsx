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
          <Listbox.Label className="block text-sm font-medium text-text-primary">
            {label}
          </Listbox.Label>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-bg-common py-3 pl-3 pr-10 text-left text-text-primary shadow-sm ring-1 ring-inset ring-bg-accent focus:outline-none focus:ring-2 focus:ring-notification-bg sm:text-sm sm:leading-6">
              <span className="block truncate">
                {translationPath ? t(`${translationPath}.${value}`) : value}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-bg-common py-1 text-base shadow-lg ring-1 ring-bg-accent focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className={({ active }) =>
                    classNames(
                      active ? 'bg-notification-bg text-notification-text' : 'text-text-primary',
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
