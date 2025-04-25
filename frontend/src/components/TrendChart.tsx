import React, { useEffect, useState, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint, Metric, TimeFilter } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface TrendChartProps {
  data: TrendDataPoint[]
  metric: Metric
  timeFilter: TimeFilter
  forecastStart?: number
  subtitle?: string
  onPointClick?: (dataPoint: TrendDataPoint) => void
  title?: string
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  metric,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timeFilter,
  forecastStart,
  subtitle,
  onPointClick,
  title
}) => {
  const { theme } = useTheme()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [_, setSelectedPointIndex] = useState<number | null>(null)
  
  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Trend line & moving average colors
  const trendLineColor = theme === 'light' ? '#22d3ee' : '#06b6d4' // Bright cyan
  const movingAvgColor = theme === 'light' ? '#a855f7' : '#c084fc' // Purple
  const seasonalColor = theme === 'light' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(251, 191, 36, 0.1)' // Amber with low opacity
  
  // Calculate appropriate tick frequency based on window width
  const getTickFrequency = (): number => {
    if (windowWidth < 640) return 6 // Show fewer ticks on small screens
    if (windowWidth < 1024) return 4
    return 2 // Show more ticks on larger screens
  }
  
  const handlePointClick = (event: any) => {
    if (onPointClick && event.points && event.points[0]) {
      const pointIndex = event.points[0].pointIndex
      setSelectedPointIndex(pointIndex)
      onPointClick(data[pointIndex])
    }
  }
  
  // Generate x and y values for the plots
  const xValues = useMemo(() => data.map(point => point.period), [data])
  
  // Calculate 3-period moving average
  const movingAverageData = useMemo(() => {
    const result: number[] = []
    const window = 3
    
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(null as any) // Use null for first points where we can't calculate MA
      } else {
        let sum = 0
        for (let j = 0; j < window; j++) {
          sum += data[i - j][metric]
        }
        result.push(sum / window)
      }
    }
    
    return result
  }, [data, metric])
  
  // Find highest and lowest points
  const [highestPoint, lowestPoint] = useMemo(() => {
    if (!data.length) return [null, null]
    
    let highest = data[0]
    let lowest = data[0]
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][metric] > highest[metric]) highest = data[i]
      if (data[i][metric] < lowest[metric]) lowest = data[i]
    }
    
    return [highest, lowest]
  }, [data, metric])
  
  // Calculate growth rate from first to last period
  const growthRate = useMemo(() => {
    if (data.length < 2) return 0
    
    const firstValue = data[0][metric]
    const lastValue = data[data.length - 1][metric]
    
    return ((lastValue - firstValue) / firstValue) * 100
  }, [data, metric])
  
  const chartTitle = useMemo(() => {
    return title || `${metric.charAt(0).toUpperCase() + metric.slice(1)} Over Time`
  }, [metric, title])
  
  const yAxisTitle = useMemo(() => {
    if (metric === 'revenue' || metric === 'margin') {
      return 'Amount ($)'
    } else if (metric === 'aov') {
      return 'Average Order Value ($)'
    } else {
      return 'Units'
    }
  }, [metric])
  
  // Set primary line color based on theme and metric
  const getLineColor = () => {
    switch (metric) {
      case 'revenue':
        return theme === 'light' ? '#6366f1' : '#818cf8' // Indigo
      case 'units':
        return theme === 'light' ? '#10b981' : '#4ade80' // Green
      case 'aov':
        return theme === 'light' ? '#f59e0b' : '#fbbf24' // Amber
      case 'margin':
        return theme === 'light' ? '#3b82f6' : '#60a5fa' // Blue
      default:
        return theme === 'light' ? '#6366f1' : '#818cf8' // Default to Indigo
    }
  }

  // Compute actual vs forecast data if forecast starting point is provided
  const [actualData, forecastData] = useMemo(() => {
    if (!forecastStart || forecastStart >= data.length) {
      return [data, []]
    }
    
    return [
      data.slice(0, forecastStart),
      data.slice(forecastStart - 1) // Overlap by 1 for continuity
    ]
  }, [data, forecastStart])
  
  // Generate x and y values for actual vs forecast
  const [actualX, actualY] = useMemo(() => {
    return [
      actualData.map(point => point.period),
      actualData.map(point => point[metric])
    ]
  }, [actualData, metric])
  
  const [forecastX, forecastY] = useMemo(() => {
    return [
      forecastData.map(point => point.period),
      forecastData.map(point => point[metric])
    ]
  }, [forecastData, metric])
  
  // Extract trend data
  const [trendX, trendY] = useMemo(() => {
    return [
      data.map(point => point.period),
      data.map(point => point.trend)
    ]
  }, [data])
  
  // Extract seasonal data
  const [seasonalX, seasonalY] = useMemo(() => {
    return [
      data.map(point => point.period),
      data.map(point => point.seasonal)
    ]
  }, [data])
  
  return (
    <div className="w-full bg-light-surface dark:bg-dark-surface rounded-xl p-4 transition-colors relative">
      {/* Period-over-Period comparison */}
      <div className="absolute top-4 right-4 z-10 bg-light-surface/80 dark:bg-dark-surface/80 border border-light-border dark:border-dark-border rounded-lg p-2 text-sm">
        <div className="flex items-center">
          {growthRate >= 0 ? (
            <ArrowUpRight size={16} className="text-light-success dark:text-dark-success mr-1" />
          ) : (
            <ArrowDownRight size={16} className="text-light-danger dark:text-dark-danger mr-1" />
          )}
          <span className={growthRate >= 0 ? "text-light-success dark:text-dark-success" : "text-light-danger dark:text-dark-danger"}>
            {growthRate >= 0 ? "+" : ""}{growthRate.toFixed(1)}% overall
          </span>
        </div>
      </div>
      
      <div className="mb-2 space-y-1">
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{chartTitle}</h2>
        {subtitle && (
          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">{subtitle}</p>
        )}
      </div>
      <div className="h-[300px]">
        <Plot
          data={[
            // Seasonal pattern area (displayed first so it's in the background)
            {
              x: seasonalX,
              y: seasonalY.map((y, i) => actualY[i] ? y + actualY[i] : y), // Offset to align with main line
              type: 'scatter' as const,
              mode: 'none' as const,
              fill: 'tozeroy',
              fillcolor: seasonalColor,
              name: 'Seasonal Pattern',
              hoverinfo: 'skip' as const,
              showlegend: true,
            },
            
            // Actual data
            {
              x: actualX,
              y: actualY,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Actual',
              line: {
                color: getLineColor(),
                width: 3,
              },
              hovertemplate: metric === 'revenue' || metric === 'margin' || metric === 'aov' ? 
                '%{y:$.2f}<extra></extra>' : '%{y}<extra></extra>',
            },
            
            // Trend line
            {
              x: trendX,
              y: trendY,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Trend',
              line: {
                color: trendLineColor,
                width: 2,
                dash: 'dash' as const,
              },
              hovertemplate: metric === 'revenue' || metric === 'margin' || metric === 'aov' ? 
                'Trend: %{y:$.2f}<extra></extra>' : 'Trend: %{y}<extra></extra>',
            },
            
            // Moving average
            {
              x: xValues,
              y: movingAverageData,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: 'Moving Avg (3-period)',
              line: {
                color: movingAvgColor,
                width: 2,
              },
              hovertemplate: metric === 'revenue' || metric === 'margin' || metric === 'aov' ? 
                'MA(3): %{y:$.2f}<extra></extra>' : 'MA(3): %{y}<extra></extra>',
            },
            
            // Forecast data if available
            ...(forecastData.length > 0
              ? [
                  {
                    x: forecastX,
                    y: forecastY,
                    type: 'scatter' as const,
                    mode: 'lines' as const,
                    name: 'Forecast',
                    line: {
                      color: getLineColor(),
                      width: 3,
                      dash: 'dash' as const,
                    },
                    hovertemplate: metric === 'revenue' || metric === 'margin' || metric === 'aov' ? 
                      '%{y:$.2f}<extra></extra>' : '%{y}<extra></extra>',
                  },
                ]
              : []),
              
            // Highest point marker
            ...(highestPoint ? [{
              x: [highestPoint.period],
              y: [highestPoint[metric]],
              type: 'scatter' as const,
              mode: 'markers' as const,
              marker: {
                color: theme === 'light' ? '#10b981' : '#4ade80', // Success green
                size: 10,
                symbol: 'circle',
              },
              name: 'Peak',
              text: ['Peak'],
              textposition: 'top center' as const,
              hoverinfo: 'skip' as const,
            }] : []),
            
            // Lowest point marker
            ...(lowestPoint ? [{
              x: [lowestPoint.period],
              y: [lowestPoint[metric]],
              type: 'scatter' as const,
              mode: 'markers' as const,
              marker: {
                color: theme === 'light' ? '#ef4444' : '#f87171', // Danger red
                size: 10,
                symbol: 'circle',
              },
              name: 'Low',
              text: ['Low'],
              textposition: 'bottom center' as const,
              hoverinfo: 'skip' as const,
            }] : []),
          ]}
          layout={{
            autosize: true,
            margin: { l: 60, r: 20, t: 10, b: 40 },
            xaxis: {
              showgrid: true,
              gridcolor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
              zeroline: false,
              fixedrange: true,
              color: theme === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
            },
            yaxis: {
              title: yAxisTitle,
              titlefont: {
                size: 12,
                color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
              },
              showgrid: true,
              gridcolor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
              zeroline: false,
              fixedrange: true,
              color: theme === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: {
              orientation: 'h',
              x: 0.5,
              y: 1.1,
              xanchor: 'center',
              font: {
                size: 12,
                color: theme === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
              },
            },
            hoverlabel: {
              bgcolor: theme === 'light' ? '#fff' : '#1e293b',
              bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
              font: {
                color: theme === 'light' ? '#334155' : '#e2e8f0',
              },
            },
            hovermode: 'x unified',
            annotations: [
              // Highest point annotation
              ...(highestPoint ? [{
                x: highestPoint.period,
                y: highestPoint[metric],
                text: 'Peak',
                showarrow: true,
                arrowhead: 2,
                arrowcolor: theme === 'light' ? '#10b981' : '#4ade80',
                arrowsize: 1,
                arrowwidth: 1.5,
                ax: 0,
                ay: -30,
                bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
                borderwidth: 1,
                bgcolor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
                font: {
                  family: 'Inter, sans-serif',
                  size: 10,
                  color: theme === 'light' ? '#334155' : '#e2e8f0'
                }
              }] : []),
              
              // Lowest point annotation
              ...(lowestPoint ? [{
                x: lowestPoint.period,
                y: lowestPoint[metric],
                text: 'Low',
                showarrow: true,
                arrowhead: 2,
                arrowcolor: theme === 'light' ? '#ef4444' : '#f87171',
                arrowsize: 1,
                arrowwidth: 1.5,
                ax: 0,
                ay: 30,
                bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
                borderwidth: 1,
                bgcolor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
                font: {
                  family: 'Inter, sans-serif',
                  size: 10,
                  color: theme === 'light' ? '#334155' : '#e2e8f0'
                }
              }] : []),
            ],
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%', height: '100%' }}
          onClick={handlePointClick}
        />
      </div>
      
      {/* Legend context explanation */}
      <div className="mt-1 pt-4 text-xs text-light-textTertiary dark:text-dark-textTertiary border-t border-light-border dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: getLineColor() }}></div>
            <span>Actual: Recorded {metric} values</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: trendLineColor }}></div>
            <span>Trend: Long-term direction</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: movingAvgColor }}></div>
            <span>MA(3): Short-term average</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 opacity-40" style={{ backgroundColor: theme === 'light' ? '#f59e0b' : '#fbbf24', borderRadius: '4px' }}></div>
            <span>Seasonal: Recurring patterns</span>
          </div>
        </div>
      </div>
    </div>
  )
} 