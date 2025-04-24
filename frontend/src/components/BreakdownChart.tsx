import React, { useEffect, useState } from 'react'
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  
  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Improved color palette with better contrast
  const colors = theme === 'light' 
    ? ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#a855f7'] 
    : ['#4ade80', '#818cf8', '#fbbf24', '#60a5fa', '#c084fc']
  
  const textColor = theme === 'light' ? '#64748b' : '#94a3b8'
  const textColorDark = theme === 'light' ? '#0f172a' : '#f8fafc'
  const backgroundColor = 'rgba(0,0,0,0)'
  
  // Format values with proper currency or number formatting
  const formatValue = (value: number): string => {
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
  
  // Custom tooltip to improve readability
  const getTooltipTemplate = () => {
    const valueFormat = metric === 'revenue' || metric === 'margin' 
      ? '$%{value:,.2f}' 
      : metric === 'aov' 
        ? '$%{value:.2f}' 
        : '%{value:,}'
    
    return `<b>%{label}</b><br>${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${valueFormat}<br>Share: %{percent}<extra></extra>`
  }
  
  const handleClick = (event: any) => {
    if (onItemClick && event.points && event.points[0]) {
      const pointIndex = event.points[0].pointIndex
      onItemClick(data[pointIndex])
    }
  }
  
  // Determine if we should use abbreviated labels based on screen size
  const useAbbreviatedLabels = windowWidth < 768
  
  // Create abbreviated labels when needed
  const getAbbreviatedName = (name: string): string => {
    if (!useAbbreviatedLabels || name.length <= 10) return name
    
    const parts = name.split(' ')
    if (parts.length > 1) {
      return parts.map(part => part.charAt(0)).join('')
    }
    
    return name.substring(0, 8) + '...'
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
                hole: 0.55, // Slightly larger hole for better aesthetics
                textinfo: 'none', // Remove text from pie slices for cleaner appearance
                hoverinfo: 'label+value+percent',
                hovertemplate: getTooltipTemplate(),
                marker: {
                  colors: colors,
                  line: {
                    color: theme === 'light' ? '#ffffff' : '#1e293b',
                    width: 2
                  }
                },
                pull: 0.01,
                direction: 'clockwise',
                sort: false, // Preserve data order
              }
            ]}
            layout={{
              autosize: true,
              title: {
                text: title,
                font: {
                  color: theme === 'light' ? '#0f172a' : '#f8fafc',
                  size: 16,
                  family: 'Inter, system-ui, sans-serif',
                },
                x: 0.01, // Left align title
                xanchor: 'left',
              },
              margin: { l: 20, r: 20, t: 50, b: 20, pad: 5 },
              paper_bgcolor: backgroundColor,
              plot_bgcolor: backgroundColor,
              showlegend: true,
              legend: {
                orientation: windowWidth < 768 ? 'h' : 'v', // Horizontal on mobile for space efficiency
                x: windowWidth < 768 ? 0.5 : 1,
                y: windowWidth < 768 ? -0.1 : 0.5,
                xanchor: windowWidth < 768 ? 'center' : 'right',
                yanchor: windowWidth < 768 ? 'top' : 'middle',
                font: {
                  color: textColor,
                  family: 'Inter, system-ui, sans-serif',
                  size: 11,
                },
                bgcolor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
                bordercolor: theme === 'light' ? 'rgba(226,232,240,0.6)' : 'rgba(51,65,85,0.6)',
                borderwidth: 1,
                itemsizing: 'constant',
                itemwidth: 30,
                tracegroupgap: 8,
                traceorder: 'normal',
              },
              annotations: [
                {
                  text: dimension.charAt(0).toUpperCase() + dimension.slice(1),
                  showarrow: false,
                  font: {
                    size: 14,
                    color: textColorDark,
                    family: 'Inter, system-ui, sans-serif',
                  },
                  x: 0.5,
                  y: 0.5
                }
              ],
              hoverlabel: { // Improved tooltip style
                bgcolor: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,41,59,0.95)',
                bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
                font: {
                  color: theme === 'light' ? '#0f172a' : '#f8fafc',
                  family: 'Inter, system-ui, sans-serif',
                  size: 12
                },
                align: 'left',
              },
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: '100%', height: '100%' }}
            onClick={onItemClick ? handleClick : undefined}
          />
          
          {/* Add custom styling for Plotly tooltips */}
          <style dangerouslySetInnerHTML={{
            __html: `
            /* Smooth animation for tooltips */
            .js-plotly-plot .plotly .hoverlabel {
              transition: opacity 0.3s ease, transform 0.3s ease !important;
              opacity: 0;
              transform: translateY(10px);
              animation: tooltipFadeIn 0.3s ease forwards;
              border-radius: 8px !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
            }
            
            .js-plotly-plot .plotly .hoverlabel .hoverlabel-text-container {
              padding: 8px 12px !important;
              font-family: 'Inter', system-ui, sans-serif !important;
            }
            
            @keyframes tooltipFadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}} />
        </div>
        
        <div className="mt-4 space-y-2.5 overflow-auto pr-1 max-h-[220px]">
          {data.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className="flex items-center cursor-pointer hover:bg-light-surfaceHover dark:hover:bg-dark-surfaceHover p-3 rounded-lg transition-all"
            >
              <div 
                className="w-2.5 h-12 rounded-full mr-3" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-grow">
                <div className="flex justify-between">
                  <div className="font-medium text-light-text dark:text-dark-text truncate mr-2 max-w-[60%]" title={item.name}>
                    {item.name}
                  </div>
                  <span className="font-bold text-light-text dark:text-dark-text">
                    {formatValue(item.value)}
                  </span>
                </div>
                <div className="w-full bg-light-border dark:bg-dark-border mt-2 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${item.share}%`,
                      backgroundColor: colors[index % colors.length] 
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  {item.share.toFixed(1)}% {item.growth !== undefined && (
                    <span className={item.growth >= 0 ? 'text-light-success dark:text-dark-success' : 'text-light-danger dark:text-dark-danger'}>
                      ({item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 