import React from 'react';

const HeaderTitle = ({ children }) => {
  return (
    <h1 className="text-2xl font-semibold text-text-primary">
      {children}
    </h1>
  );
};

export default HeaderTitle;
