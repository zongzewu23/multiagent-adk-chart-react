import React from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import Plot from 'react-plotly.js'
import { Metric } from '../types'
import { useTheme } from '../contexts/ThemeContext'

interface KPICardProps {
  title: string
  value: number
  growth: number
  sparklineData: number[]
  icon: React.ReactNode
  metric: Metric
  isSelected: boolean
  onClick: (metric: Metric) => void
  description?: string
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  growth,
  sparklineData,
  icon,
  metric,
  isSelected,
  onClick,
  description
}) => {
  const { theme } = useTheme()
  
  // Format the value based on the metric type
  const getFormattedValue = () => {
    if (metric === 'revenue' || metric === 'margin') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${value.toLocaleString()}`
    } else if (metric === 'aov') {
      return `$${value.toFixed(2)}`
    } else {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
      return value.toLocaleString()
    }
  }
  
  // Determine colors based on growth value
  const growthColor = growth >= 0 
    ? theme === 'light' ? 'text-light-success' : 'text-dark-success'
    : theme === 'light' ? 'text-light-danger' : 'text-dark-danger'
  
  // Generate sparkline chart data
  const sparklineData1 = sparklineData.map((val, i) => ({ x: i, y: val }))
  
  return (
    <div 
      className={`p-4 rounded-xl transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'bg-light-primary/10 dark:bg-dark-primary/20 ring-1 ring-light-primary dark:ring-dark-primary' 
          : 'bg-light-surface dark:bg-dark-surface hover:bg-light-surfaceHover dark:hover:bg-dark-surfaceHover'
      }`}
      onClick={() => onClick(metric)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-light-textSecondary dark:text-dark-textSecondary font-medium capitalize">{title}</h3>
          {description && (
            <div className="relative group">
              <Info size={14} className="text-light-textSecondary/50 dark:text-dark-textSecondary/50 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {description}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-light-surfaceHover dark:bg-dark-surfaceHover">
          {icon}
        </div>
      </div>
      
      <div className="mb-2">
        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
          {getFormattedValue()}
        </div>
        <div className="flex items-center text-sm">
          {growth >= 0 
            ? <TrendingUp size={16} className={`${growthColor} mr-1`} />
            : <TrendingDown size={16} className={`${growthColor} mr-1`} />
          }
          <span className={`${growthColor} font-medium`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="h-12">
        <Plot
          data={[
            {
              x: sparklineData1.map(d => d.x),
              y: sparklineData1.map(d => d.y),
              type: 'scatter',
              mode: 'lines',
              line: {
                color: isSelected 
                  ? theme === 'light' ? '#4f46e5' : '#818cf8'
                  : theme === 'light' ? '#94a3b8' : '#64748b',
                width: 2,
                shape: 'spline',
              },
              hoverinfo: 'none',
            },
          ]}
          layout={{
            autosize: true,
            margin: { l: 0, r: 0, t: 0, b: 0, pad: 0 },
            xaxis: {
              visible: false,
              fixedrange: true,
            },
            yaxis: {
              visible: false,
              fixedrange: true,
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            hovermode: false,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
} 