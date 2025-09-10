import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface EnhancedSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

interface EnhancedSelectProps {
  options: EnhancedSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  searchable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
}

export function EnhancedSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled = false,
  className,
  dropdownClassName,
  searchable = false,
  multiple = false,
  maxHeight = 256
}: EnhancedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (value ? [value] : []) : (value ? [value] : [])
  );
  
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        }
        event.preventDefault();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            Math.min(prev + 1, filteredOptions.length - 1)
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newSelection = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newSelection);
      onValueChange(newSelection.join(','));
    } else {
      onValueChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  };

  return (
    <div ref={selectRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          isOpen && "ring-2 ring-ring ring-offset-2",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
      >
        <span className={cn(
          "block truncate text-left",
          !selectedOption && "text-muted-foreground"
        )}>
          {selectedOption?.icon && (
            <span className="mr-2 inline-flex items-center">
              {selectedOption.icon}
            </span>
          )}
          {selectedLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-pop",
            "animate-fade-in-up",
            isMobile && "fixed inset-x-4 top-auto bottom-4 w-auto",
            dropdownClassName
          )}
          style={{ maxHeight: isMobile ? '60vh' : maxHeight }}
        >
          {searchable && (
            <div className="p-2 border-b">
              <input
                ref={searchRef}
                type="text"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <ul
            ref={listRef}
            className="overflow-auto p-1"
            style={{ maxHeight: searchable ? maxHeight - 60 : maxHeight }}
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                No options found
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={cn(
                    "relative cursor-pointer select-none rounded px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    focusedIndex === index && "bg-accent text-accent-foreground",
                    option.disabled && "pointer-events-none opacity-50",
                    selectedValues.includes(option.value) && "bg-primary/10 text-primary"
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  role="option"
                  aria-selected={selectedValues.includes(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {option.icon && (
                        <span className="flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedValues.includes(option.value) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}