import React from 'react'
import Plot from 'react-plotly.js'
import { TopPerformer, Metric } from '../types'
import { useTheme } from '../contexts/ThemeContext'

interface BreakdownChartProps {
  data: TopPerformer[]
  metric: Metric
  dimension: string
  title: string
  onItemClick?: (item: TopPerformer) => void
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  data,
  metric,
  dimension,
  title,
  onItemClick
}) => {
  const { theme } = useTheme()
  
  const colors = theme === 'light' 
    ? ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#a855f7'] 
    : ['#4ade80', '#818cf8', '#fbbf24', '#60a5fa', '#c084fc']
  
  const textColor = theme === 'light' ? '#64748b' : '#94a3b8'
  const backgroundColor = 'rgba(0,0,0,0)'
  
  const formatValue = (value: number): string => {
    if (metric === 'revenue' || metric === 'margin') {
      return `$${value.toLocaleString()}`
    } else if (metric === 'aov') {
      return `$${value.toFixed(2)}`
    } else {
      return value.toLocaleString()
    }
  }
  
  const handleClick = (event: any) => {
    if (onItemClick && event.points && event.points[0]) {
      const pointIndex = event.points[0].pointIndex
      onItemClick(data[pointIndex])
    }
  }
  
  return (
    <div className="h-full w-full">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <Plot
            data={[
              {
                labels: data.map(item => item.name),
                values: data.map(item => item.value),
                type: 'pie',
                hole: 0.5,
                textinfo: 'percent',
                textposition: 'inside',
                insidetextfont: {
                  color: '#ffffff',
                  size: 12
                },
                hoverinfo: 'label+value+percent',
                hovertemplate: '%{label}<br>%{value:,.2f}<br>%{percent}<extra></extra>',
                marker: {
                  colors: colors
                },
                pull: 0.01,
              }
            ]}
            layout={{
              autosize: true,
              title: {
                text: title,
                font: {
                  color: theme === 'light' ? '#0f172a' : '#f8fafc',
                  size: 16,
                },
              },
              margin: { l: 30, r: 30, t: 50, b: 30, pad: 0 },
              paper_bgcolor: backgroundColor,
              plot_bgcolor: backgroundColor,
              showlegend: true,
              legend: {
                orientation: 'h',
                x: 0.5,
                y: 0,
                xanchor: 'center',
                yanchor: 'bottom',
                font: {
                  color: textColor,
                },
              },
              annotations: [
                {
                  text: dimension.charAt(0).toUpperCase() + dimension.slice(1),
                  showarrow: false,
                  font: {
                    size: 14,
                    color: textColor
                  },
                  x: 0.5,
                  y: 0.5
                }
              ]
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: '100%', height: '100%' }}
            onClick={onItemClick ? handleClick : undefined}
          />
        </div>
        
        <div className="mt-4 space-y-3">
          {data.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className="flex items-center cursor-pointer hover:bg-light-surfaceHover dark:hover:bg-dark-surfaceHover p-3 rounded-lg transition-all"
            >
              <div 
                className="w-1 h-10 rounded-full mr-3" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-grow">
                <div className="flex justify-between">
                  <span className="font-medium text-light-text dark:text-dark-text">{item.name}</span>
                  <span className="font-bold text-light-text dark:text-dark-text">
                    {formatValue(item.value)}
                  </span>
                </div>
                <div className="w-full bg-light-border dark:bg-dark-border mt-1 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${item.share}%`,
                      backgroundColor: colors[index % colors.length] 
                    }}
                  />
                </div>
              </div>
              <div className="ml-3 text-light-textSecondary dark:text-dark-textSecondary">
                {item.share.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 