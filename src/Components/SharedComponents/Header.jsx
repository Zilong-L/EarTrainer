import React from 'react';

const Header = ({ children }) => {
  return (
    <header className="w-full bg-white dark:bg-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
};

export default Header;
