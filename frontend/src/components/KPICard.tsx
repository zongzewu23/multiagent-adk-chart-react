import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
}

const formatValue = (value: number, metric: Metric): string => {
  if (metric === 'revenue' || metric === 'margin') {
    return `$${(value / 1000).toFixed(1)}K`
  } else if (metric === 'aov') {
    return `$${value.toFixed(2)}`
  } else {
    return value.toLocaleString()
  }
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  growth,
  sparklineData,
  icon,
  metric,
  isSelected,
  onClick
}) => {
  const { theme } = useTheme()
  const isPositiveGrowth = growth >= 0
  
  const metricColors = {
    revenue: theme === 'light' ? '#6366f1' : '#818cf8',
    units: theme === 'light' ? '#10b981' : '#4ade80',
    aov: theme === 'light' ? '#f59e0b' : '#fbbf24',
    margin: theme === 'light' ? '#3b82f6' : '#60a5fa'
  }
  
  const bgColors = {
    light: {
      selected: 'bg-white shadow-lg shadow-light-primary/10',
      normal: 'bg-white hover:shadow-md'
    },
    dark: {
      selected: 'bg-dark-surface shadow-lg shadow-dark-primary/20',
      normal: 'bg-dark-surface hover:shadow-md'
    }
  }
  
  const cardBg = isSelected
    ? bgColors[theme].selected
    : bgColors[theme].normal
    
  return (
    <div
      className={`relative rounded-xl p-5 cursor-pointer transition-all duration-300 ${cardBg} ${
        isSelected ? 'ring-1 ring-light-accent dark:ring-dark-accent' : ''
      }`}
      onClick={() => onClick(metric)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${metricColors[metric]}20` }}
          >
            {icon}
          </div>
          <h3 className="text-light-textSecondary dark:text-dark-textSecondary font-medium capitalize">
            {title}
          </h3>
        </div>
        
        <div
          className={`flex items-center px-2 py-1 rounded-full text-xs ${
            isPositiveGrowth
              ? 'bg-light-success/20 text-light-success dark:bg-dark-success/20 dark:text-dark-success'
              : 'bg-light-danger/20 text-light-danger dark:bg-dark-danger/20 dark:text-dark-danger'
          }`}
        >
          {isPositiveGrowth ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          <span>{Math.abs(growth).toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="mt-3">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
          {formatValue(value, metric)}
        </h2>
        <div className="h-10 mt-3">
          <Plot
            data={[
              {
                x: Array.from({ length: sparklineData.length }, (_, i) => i),
                y: sparklineData,
                type: 'scatter',
                mode: 'lines',
                line: {
                  color: metricColors[metric],
                  width: 2,
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
    </div>
  )
} 