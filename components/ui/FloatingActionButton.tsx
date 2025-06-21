
import React from 'react';

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ icon, className = '', ...props }) => {
  return (
    <button
      className={`fixed bottom-20 right-4 md:hidden bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-40 transition-transform duration-200 ease-in-out hover:scale-105 ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
