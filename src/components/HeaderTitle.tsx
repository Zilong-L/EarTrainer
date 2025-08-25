import React from 'react';

interface HeaderTitleProps {
  children: React.ReactNode;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ children }) => {
  return (
    <h1 className="text-2xl font-semibold text-text-primary">{children}</h1>
  );
};

export default HeaderTitle;
