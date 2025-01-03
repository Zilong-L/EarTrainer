import React from 'react';

const Button = ({ 
  onClick, 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus:outline-none';
  
  const variants = {
    primary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
