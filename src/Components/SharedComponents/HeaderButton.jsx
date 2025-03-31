import React from 'react';

const HeaderButton = ({ onClick, children, className = '' }) => {
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
