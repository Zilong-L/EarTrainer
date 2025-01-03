import React from 'react';

const HeaderButton = ({ onClick, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </button>
  );
};

export default HeaderButton;
