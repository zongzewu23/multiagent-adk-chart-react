import React, { useRef, useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface StyledDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export const StyledDropdown: React.FC<StyledDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  className = ''
}) => {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Get the selected option label
  const selectedOption = options.find(option => option.value === value)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }
  
  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      toggleDropdown()
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault()
      const currentIndex = options.findIndex(option => option.value === value)
      const nextIndex = (currentIndex + 1) % options.length
      onChange(options[nextIndex].value)
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault()
      const currentIndex = options.findIndex(option => option.value === value)
      const prevIndex = (currentIndex - 1 + options.length) % options.length
      onChange(options[prevIndex].value)
    }
  }
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <span className="text-light-textSecondary dark:text-dark-textSecondary mr-2">
          {label}:
        </span>
      )}
      
      <div 
        className="flex items-center min-w-[120px] bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md px-3 py-1.5 cursor-pointer"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="dropdown-options"
        aria-label={label || "Select an option"}
      >
        <span className="flex-grow text-light-text dark:text-dark-text">
          {selectedOption?.label || value}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-light-textSecondary dark:text-dark-textSecondary transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md shadow-lg max-h-60 overflow-auto">
          <ul
            id="dropdown-options"
            role="listbox"
            className="py-1"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  option.value === value
                    ? 'bg-light-primary/10 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary'
                    : 'text-light-text dark:text-dark-text hover:bg-light-surfaceHover dark:hover:bg-dark-surfaceHover'
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 