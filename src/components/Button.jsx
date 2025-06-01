import React from 'react';

const Button = ({ 
  onClick, 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus:outline-none shadow-sm hover:shadow-md';
  
  const variants = {
    primary: 'bg-bg-accent text-text-primary ',
    secondary: 'bg-bg-accent text-text-primary',
    outline: 'border border-bg-accent text-text-primary'
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
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
