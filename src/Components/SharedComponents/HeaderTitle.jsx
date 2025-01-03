import React from 'react';

const HeaderTitle = ({ children }) => {
  return (
    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
      {children}
    </h1>
  );
};

export default HeaderTitle;
