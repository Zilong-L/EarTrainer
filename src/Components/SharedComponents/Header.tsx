import React from 'react';
interface HeaderProps {
  children: React.ReactNode;
}

function Header({ children }: HeaderProps) {
  return (
    <header className="w-full bg-bg-main shadow-sm">
      <div className="max-w-6xl  mx-auto px-4 py-3 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
}

export default Header;
