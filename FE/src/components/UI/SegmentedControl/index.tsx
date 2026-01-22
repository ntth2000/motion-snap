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
    <div className={`flex w-full items-baseline justify-start rounded-lg bg-gray-100 p-1 sm:w-auto ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              group flex-1 items-center justify-center whitespace-nowrap py-2 align-middle transition-all duration-300 ease-in-out 
              w-full gap-1.5 px-3 sm:w-auto rounded-md cursor-pointer
              ${isActive
                ? 'bg-white text-primary shadow-sm'
                : 'bg-transparent text-secondary hover:text-primary'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};