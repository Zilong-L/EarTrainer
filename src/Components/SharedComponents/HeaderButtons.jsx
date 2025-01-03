import React from 'react';

const HeaderButtons = ({ children }) => {
  return (
    <div className="flex items-center space-x-4">
      {children}
    </div>
  );
};

export default HeaderButtons;
