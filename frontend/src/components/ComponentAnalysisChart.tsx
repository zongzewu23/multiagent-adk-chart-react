import React, { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint, AnalysisComponentData } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { format } from 'date-fns'

interface ComponentAnalysisChartProps {
  data: AnalysisComponentData
  title: string
}

export const ComponentAnalysisChart: React.FC<ComponentAnalysisChartProps> = ({
  data,
  title
}) => {
  const { theme } = useTheme()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  
  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  interface TimeSeriesPoint {
    period: string
    value: number
  }
  
  // Add null checking to prevent "Cannot read properties of undefined (reading 'map')" error
  const getDates = (points: TimeSeriesPoint[] | undefined): Date[] => {
    if (!points || !Array.isArray(points)) return []
    return points.map(point => new Date(point.period))
  }
  
  // Add null checking for values as well
  const getValues = (points: TimeSeriesPoint[] | undefined): number[] => {
    if (!points || !Array.isArray(points)) return []
    return points.map(point => point.value)
  }
  
  // Calculate appropriate tick frequency based on window width
  const getTickFrequency = (): number => {
    if (windowWidth < 640) return 6 // Show fewer ticks on small screens
    if (windowWidth < 1024) return 4
    return 2 // Show more ticks on larger screens
  }
  
  // Format date labels appropriately
  const formatDateLabel = (date: Date): string => {
    return format(date, 'MMM d, yyyy')
  }
  
  // Format values with appropriate suffixes
  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(1)
  }
  
  // Enhanced colors with better visibility for charts
  const lineColors = {
    trend: theme === 'light' ? '#3b82f6' : '#60a5fa',
    seasonal: theme === 'light' ? '#10b981' : '#4ade80',
    residual: theme === 'light' ? '#f59e0b' : '#fbbf24'
  }
  
  const gridColor = theme === 'light' ? 'rgba(226,232,240,0.6)' : 'rgba(51,65,85,0.6)'
  const textColor = theme === 'light' ? '#64748b' : '#94a3b8'
  const textColorDark = theme === 'light' ? '#0f172a' : '#f8fafc'
  const backgroundColor = 'rgba(0,0,0,0)'
  
  // Helper function to determine chart type from title
  const getChartType = (): 'trend' | 'seasonal' | 'residual' => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('trend')) return 'trend'
    if (titleLower.includes('season')) return 'seasonal'
    if (titleLower.includes('resid')) return 'residual'
    // Default to trend if no match
    return 'trend'
  }
  
  // Determine which data to show based on title and add defensive checks
  const getChartData = () => {
    // Check if data exists and has required properties
    if (!data) {
      console.warn('No data provided to ComponentAnalysisChart')
      return {
        chartData: [],
        tickvals: [],
        ticktext: []
      }
    }
    
    // Determine which dataset to use based on the chart type
    const chartType = getChartType()
    let sourceData: TimeSeriesPoint[] | undefined
    
    switch (chartType) {
      case 'trend':
        sourceData = data.trend
        break
      case 'seasonal':
        sourceData = data.seasonal
        break
      case 'residual':
        sourceData = data.residual
        break
    }
    
    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
      console.warn(`No ${chartType} data available for chart`)
      return {
        chartData: [],
        tickvals: [],
        ticktext: []
      }
    }
    
    // Get dates from the appropriate data source
    const dates = getDates(sourceData)
    
    // If no dates are available, return empty data
    if (dates.length === 0) {
      console.warn('No date values available for chart')
      return {
        chartData: [],
        tickvals: [],
        ticktext: []
      }
    }
    
    const tickvals = dates.filter((_, i) => i % getTickFrequency() === 0)
    const ticktext = tickvals.map(date => formatDateLabel(date))
    
    // Get values
    const values = getValues(sourceData)
    
    // Calculate min and max for better y-axis range
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const yaxisRange = [
      minValue - Math.abs(minValue * 0.1), // 10% padding below
      maxValue + Math.abs(maxValue * 0.1)  // 10% padding above
    ]
    
    console.log(`Chart type: ${chartType}, Data points: ${values.length}, Min: ${minValue}, Max: ${maxValue}`)
    
    let chartData: any[] = []
    
    // Create the appropriate chart based on type
    switch (chartType) {
      case 'trend':
        chartData.push({
          x: dates,
          y: values,
          type: 'scatter',
          mode: 'lines',
          name: 'Trend',
          line: {
            color: lineColors.trend,
            width: 3,
            shape: 'spline'
          },
          opacity: 1,
          hovertemplate: '%{x|%b %d, %Y}: %{y:,.1f}<extra></extra>'
        })
        break
        
      case 'seasonal':
        // For seasonal data, use a bar chart for better visibility
        chartData.push({
          x: dates,
          y: values,
          type: 'bar',
          name: 'Seasonal',
          marker: {
            color: lineColors.seasonal,
            opacity: 0.8,
          },
          hovertemplate: '%{x|%b %d, %Y}: %{y:,.1f}<extra></extra>'
        })
        break
        
      case 'residual':
        // For residuals, use scatter points with lines
        chartData.push({
          x: dates,
          y: values,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Residual',
          marker: {
            color: lineColors.residual,
            size: 6,
            opacity: 0.8
          },
          line: {
            color: lineColors.residual,
            width: 2
          },
          hovertemplate: '%{x|%b %d, %Y}: %{y:,.1f}<extra></extra>'
        })
        
        // Add zero line for residual chart with higher opacity
        const zeroLine = new Array(dates.length).fill(0)
        chartData.push({
          x: dates,
          y: zeroLine,
          type: 'scatter',
          mode: 'lines',
          name: 'Baseline',
          line: {
            color: theme === 'light' ? 'rgba(100,116,139,0.5)' : 'rgba(148,163,184,0.5)',
            width: 1.5,
            dash: 'dot'
          },
          hoverinfo: 'skip'
        })
        break
    }
    
    return {
      chartData,
      tickvals,
      ticktext,
      yaxisRange
    }
  }
  
  const { chartData, tickvals, ticktext, yaxisRange } = getChartData()
  
  // Add conditional rendering if data is not available
  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center p-4 text-light-textSecondary dark:text-dark-textSecondary">
          No data available
        </div>
      </div>
    )
  }
  
  // If chart data is empty after processing, show a clear message
  if (chartData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center p-4 text-light-textSecondary dark:text-dark-textSecondary">
          No {getChartType()} data available for analysis
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full w-full">
      <Plot
        data={chartData}
        layout={{
          autosize: true,
          title: {
            text: title,
            font: {
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
              family: 'Inter, system-ui, sans-serif',
              size: 16,
            },
            x: 0.01,
            xanchor: 'left'
          },
          margin: { l: 50, r: 25, t: 50, b: 50, pad: 4 },
          paper_bgcolor: backgroundColor,
          plot_bgcolor: backgroundColor,
          showlegend: false,
          xaxis: {
            showgrid: true,
            gridcolor: gridColor,
            gridwidth: 0.5,
            zeroline: false,
            tickvals: tickvals,
            ticktext: ticktext,
            tickangle: -30,
            tickfont: {
              family: 'Inter, system-ui, sans-serif',
              size: 10,
              color: textColor
            },
            tickformat: '%b %d',
            tickmode: 'array',
            nticks: 5,
            fixedrange: true,
          },
          yaxis: {
            showgrid: true,
            gridcolor: gridColor,
            gridwidth: 0.5,
            zeroline: false,
            tickfont: {
              family: 'Inter, system-ui, sans-serif',
              size: 10,
              color: textColor
            },
            fixedrange: true,
            tickformat: ',~s', // Smart number formatting
            hoverformat: ',.1f',
            automargin: true,
            range: yaxisRange, // Explicitly set y-axis range for better visibility
          },
          hovermode: 'closest',
          hoverlabel: {
            bgcolor: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,41,59,0.95)',
            bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 12,
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
            },
            align: 'left',
          },
          dragmode: false,
        }}
        config={{
          displayModeBar: false,
          responsive: true
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
} 