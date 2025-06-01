import React from 'react';

interface HeaderButtonsProps {
  children: React.ReactNode;
  title?: string;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({ children, title }) => {
  return (
    <div className="flex items-center space-x-4" title={title}>
      {children}
    </div>
  );
};

export default HeaderButtons;
