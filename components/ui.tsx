import React from 'react';
import { Loader2, ChevronLeft, ArrowRight } from 'lucide-react';

// --- ATOMS (Basic Elements) ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'outline-primary';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  size = 'md',
  ...props 
}) => {
  const baseStyles = "rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const sizes = {
    sm: "py-2 px-3 text-xs",
    md: "py-3.5 px-4 text-sm",
    lg: "py-4 px-6 text-base"
  };

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
    outline: "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800",
    "outline-primary": "border border-primary text-primary hover:bg-orange-50 bg-white dark:bg-gray-900 dark:hover:bg-gray-800",
    ghost: "bg-transparent text-primary hover:bg-orange-50 dark:hover:bg-gray-800"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, rightIcon, onRightIconClick, className, containerClassName, ...props }) => {
  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input 
          className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${icon ? 'pl-11' : ''} ${rightIcon ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <button 
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'orange' | 'gray'; className?: string }> = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

// --- MOLECULES (Composite Components) ---

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction, subtitle, className = '' }) => (
  <div className={`p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0 bg-white dark:bg-gray-900 z-10 shadow-sm transition-colors duration-300 ${className}`}>
    {onBack && (
      <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
        <ChevronLeft size={24} />
      </button>
    )}
    <div className="flex-1">
      <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{title}</h1>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
    {rightAction}
  </div>
);

export const Section: React.FC<{ title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, action, children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {title && (
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

interface ListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({ icon, title, subtitle, rightElement, onClick, className = '' }) => (
  <div 
    onClick={onClick}
    className={`flex items-start gap-4 p-0 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {icon && <div className="mt-1 text-gray-400 group-hover:text-primary transition-colors">{icon}</div>}
    <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
      <div className="flex justify-between items-start mb-0.5">
        <p className="font-bold text-sm text-gray-900 dark:text-white">{title}</p>
        {rightElement || (onClick && <ArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-primary" size={16} />)}
      </div>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-4">{subtitle}</p>}
    </div>
  </div>
);

// --- TEMPLATES (Layouts) ---

interface ScreenLayoutProps {
  children: React.ReactNode;
  className?: string;
  bgClass?: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, className = '', bgClass = 'bg-white dark:bg-gray-900' }) => (
  <div className={`flex flex-col h-full ${bgClass} ${className}`}>
    {children}
  </div>
);

export const ScrollableContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 space-y-4 md:space-y-6 pb-28 ${className}`}>
    {children}
  </div>
);

// Deprecated BackButton wrapper
export const BackButton: React.FC<{ onClick: () => void, title?: string }> = ({ onClick, title }) => (
  <Header title={title || ''} onBack={onClick} />
);