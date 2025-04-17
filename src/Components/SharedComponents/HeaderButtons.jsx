import React from 'react';

const HeaderButtons = ({ children, title }) => {
  return (
    <div className="flex items-center space-x-4" title={title}>
      {children}
    </div>
  );
};

export default HeaderButtons;
