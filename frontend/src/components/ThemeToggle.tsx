import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-full p-2 transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-light-surface text-light-primary hover:bg-light-surfaceHover'
          : 'bg-dark-surface text-dark-primary hover:bg-dark-surfaceHover'
      } ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun size={20} className="transition-transform duration-300 ease-out animate-pulse-slow" />
      ) : (
        <Moon size={20} className="transition-transform duration-300 ease-out animate-pulse-slow" />
      )}
      
      <span className="sr-only">
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </span>
    </button>
  )
} 