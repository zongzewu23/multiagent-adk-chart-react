import React from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Dashboard } from './components/Dashboard'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}

export default App 