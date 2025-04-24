import React, { ReactNode } from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { useTheme } from '../contexts/ThemeContext'

interface CustomScrollbarProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  autoHide?: boolean
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  children,
  className = '',
  style = {},
  autoHide = true,
}) => {
  const { theme } = useTheme()
  
  // Get theme-specific colors
  const thumbColor = theme === 'light' 
    ? 'rgba(99, 102, 241, 0.6)' // light-primary
    : 'rgba(129, 140, 248, 0.6)' // dark-primary
  
  const trackColor = theme === 'light'
    ? 'rgba(226, 232, 240, 0.6)' // light-border
    : 'rgba(51, 65, 85, 0.6)' // dark-border
  
  // Custom scrollbar styling using CSS
  const customScrollbarStyles = `
    .simplebar-scrollbar::before {
      background-color: ${thumbColor};
      opacity: 0.6;
      border-radius: 4px;
      border: none;
    }
    
    .simplebar-track.simplebar-vertical {
      background-color: ${trackColor};
      border-radius: 4px;
      width: 8px;
      transition: opacity 0.2s ease;
      right: 2px;
    }
    
    .simplebar-track.simplebar-horizontal {
      background-color: ${trackColor};
      border-radius: 4px;
      height: 8px;
      transition: opacity 0.2s ease;
      bottom: 2px;
    }
  `
  
  return (
    <>
      <SimpleBar
        className={`custom-scrollbar ${className}`}
        style={{
          height: '100%',
          ...style
        }}
        autoHide={autoHide}
      >
        {children}
      </SimpleBar>
      
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
    </>
  )
} 