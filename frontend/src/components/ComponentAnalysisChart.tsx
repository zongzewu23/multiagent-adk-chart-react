import React, { useState, useEffect, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint, AnalysisComponentData } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { format, subMonths, addMonths } from 'date-fns'

interface ComponentAnalysisChartProps {
  data: AnalysisComponentData
  title: string
}

// Interface for time series data points
interface TimeSeriesPoint {
  period: string
  value: number
}

// Function to generate mock seasonal and residual data
const generateMockAnalysisData = (): AnalysisComponentData => {
  const startDate = new Date(2023, 0, 1) // Start with January 2023
  const months = 24 // Generate 2 years of data
  
  const trendData: TimeSeriesPoint[] = []
  const seasonalData: TimeSeriesPoint[] = []
  const residualData: TimeSeriesPoint[] = []
  
  for (let i = 0; i < months; i++) {
    const currentDate = new Date(startDate)
    currentDate.setMonth(startDate.getMonth() + i)
    const period = format(currentDate, 'yyyy-MM') // Format as 'YYYY-MM'
    
    // Create a linear trend with small slope
    const trendValue = 1000 + (i * 50)
    
    // Create seasonal pattern (higher in summer months, lower in winter)
    // This creates a sine wave pattern with peak in July and trough in January
    const seasonalValue = 300 * Math.sin((i / 12) * Math.PI * 2)
    
    // Random residuals (random noise)
    const residualValue = (Math.random() - 0.5) * 200
    
    trendData.push({ period, value: trendValue })
    seasonalData.push({ period, value: seasonalValue })
    residualData.push({ period, value: residualValue })
  }
  
  return {
    trend: trendData,
    seasonal: seasonalData,
    residual: residualData
  }
}

export const ComponentAnalysisChart: React.FC<ComponentAnalysisChartProps> = ({
  data,
  title
}) => {
  const { theme } = useTheme()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  
  // Helper function to determine chart type from title
  const getChartType = (chartTitle: string): 'trend' | 'seasonal' | 'residual' => {
    const titleLower = chartTitle.toLowerCase()
    if (titleLower.includes('trend')) return 'trend'
    if (titleLower.includes('season')) return 'seasonal'
    if (titleLower.includes('resid')) return 'residual'
    // Default to trend if no match
    return 'trend'
  }
  
  // Generate or use actual data
  const analysisData = useMemo(() => {
    // If we have valid data, use it
    const chartType = getChartType(title)
    const hasValidData = data && 
      ((chartType === 'trend' && data.trend && data.trend.length > 0) ||
       (chartType === 'seasonal' && data.seasonal && data.seasonal.length > 0) ||
       (chartType === 'residual' && data.residual && data.residual.length > 0))
    
    console.log(`Chart type: ${chartType}, Has valid data: ${hasValidData}, Using mock: ${!hasValidData}`)
    
    // Otherwise generate mock data
    return hasValidData ? data : generateMockAnalysisData()
  }, [data, title])
  
  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
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
  
  // Determine which data to show based on title and add defensive checks
  const getChartData = () => {
    // Check if data exists and has required properties
    if (!analysisData) {
      console.warn('No data provided to ComponentAnalysisChart')
      return {
        chartData: [],
        tickvals: [],
        ticktext: [],
        yaxisRange: [0, 1]
      }
    }
    
    // Determine which dataset to use based on the chart type
    const chartType = getChartType(title)
    let sourceData: TimeSeriesPoint[] | undefined
    
    switch (chartType) {
      case 'trend':
        sourceData = analysisData.trend
        break
      case 'seasonal':
        sourceData = analysisData.seasonal
        break
      case 'residual':
        sourceData = analysisData.residual
        break
    }
    
    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
      console.warn(`No ${chartType} data available for chart`)
      return {
        chartData: [],
        tickvals: [],
        ticktext: [],
        yaxisRange: [0, 1]
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
        ticktext: [],
        yaxisRange: [0, 1]
      }
    }
    
    const tickvals = dates.filter((_, i) => i % getTickFrequency() === 0)
    const ticktext = tickvals.map(date => format(date, 'MMM yyyy'))
    
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
      yaxisRange,
      isMockData: !data || !sourceData // Indicate if we're using mock data
    }
  }
  
  const { chartData, tickvals, ticktext, yaxisRange, isMockData } = getChartData()
  
  // If chart data is empty even after using mock data, show a message
  if (chartData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center p-4 text-light-textSecondary dark:text-dark-textSecondary">
          No {getChartType(title)} data available for analysis
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full w-full relative">
      {/* Mock data indicator */}
      {isMockData && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-light-surface dark:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary text-xs rounded-md opacity-70 z-10">
          Sample Data
        </div>
      )}
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
  )
} 