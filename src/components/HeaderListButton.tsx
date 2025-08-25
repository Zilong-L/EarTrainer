import React from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

interface HeaderListButtonProps {
  buttonLabel: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

const HeaderListButton: React.FC<HeaderListButtonProps> = ({
  buttonLabel,
  items,
  className = '',
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className={`p-2 rounded-md text-text-secondary hover:shadow-md ${className}`}
      >
        {buttonLabel}
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-bg-main border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
        {items.map((item, index) => (
          <MenuItem key={index}>
            {() => (
              <button
                onClick={item.onClick}
                className={`w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent ${index === 0 ? 'rounded-t-md' : ''} ${index === items.length - 1 ? 'rounded-b-md' : ''}`}
              >
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

export default HeaderListButton;
