import React from 'react';

interface HeaderButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ onClick, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:cursor-pointer  text-text-secondary hover:shadow-md ${className}`}
    >
      {children}
    </button>
  );
};

export default HeaderButton;
