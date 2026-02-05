import React from 'react';

interface SegmentedOption {
  label: React.ReactNode;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl = ({ options, value, onChange, className = '' }: SegmentedControlProps) => {
  return (
    <div className={`flex w-full items-center justify-start border-b border-slate-200 ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              font-light cursor-pointer relative flex-1 items-center justify-center whitespace-nowrap py-3 px-4 text-sm transition-colors duration-200
              ${isActive
                ? 'text-primary'
                : 'text-slate-400 hover:text-slate-600'
              }
            `}
          >
            {option.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};