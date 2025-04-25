import React, { useState, useEffect, useMemo } from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint, AnalysisComponentData } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { format, subMonths, addMonths, isEqual, isAfter, isBefore } from 'date-fns'
import { Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface ComponentAnalysisChartProps {
  data: AnalysisComponentData
  title: string
}

// Interface for time series data points
interface TimeSeriesPoint {
  period: string
  value: number
}

// Interface for business insights
interface BusinessInsight {
  title: string
  description: string
  type: 'positive' | 'neutral' | 'negative' | 'info'
}

// Interface for seasonal annotations
interface SeasonalAnnotation {
  date: Date
  text: string
  position: 'top' | 'bottom'
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
  const [viewMode, setViewMode] = useState<'raw' | 'story'>('story')
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
  
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
    return format(date, 'MMM yyyy')
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
  
  // Generate seasonal annotations for storytelling
  const getSeasonalAnnotations = (
    dates: Date[], 
    values: number[]
  ): SeasonalAnnotation[] => {
    if (dates.length === 0 || values.length === 0) return []
    
    const annotations: SeasonalAnnotation[] = []
    const chartType = getChartType(title)
    
    if (chartType === 'seasonal') {
      // Find peak and trough months
      const peakIndices: number[] = []
      const troughIndices: number[] = []
      
      // Simple peak/trough detection
      for (let i = 1; i < values.length - 1; i++) {
        // Check if this is a local maximum (peak)
        if (values[i] > values[i-1] && values[i] > values[i+1] && values[i] > 0) {
          peakIndices.push(i)
        }
        // Check if this is a local minimum (trough)
        else if (values[i] < values[i-1] && values[i] < values[i+1] && values[i] < 0) {
          troughIndices.push(i)
        }
      }
      
      // Get December months (holiday season)
      const decemberIndices = dates
        .map((date, index) => date.getMonth() === 11 ? index : -1)
        .filter(index => index !== -1)
      
      // Get July months (summer season)
      const julyIndices = dates
        .map((date, index) => date.getMonth() === 6 ? index : -1)
        .filter(index => index !== -1)
      
      // Add December annotation (if positive)
      decemberIndices.forEach(index => {
        if (values[index] > 0) {
          annotations.push({
            date: dates[index],
            text: 'Holiday shopping surge',
            position: 'top',
            value: values[index]
          })
        }
      })
      
      // Add summer annotation (if positive)
      julyIndices.forEach(index => {
        if (values[index] > 0) {
          annotations.push({
            date: dates[index],
            text: 'Summer sales peak',
            position: 'top',
            value: values[index]
          })
        }
      })
      
      // Add Q1 annotation (if negative)
      const q1Indices = dates
        .map((date, index) => (date.getMonth() === 0 || date.getMonth() === 1) ? index : -1)
        .filter(index => index !== -1)
      
      q1Indices.forEach(index => {
        if (values[index] < 0) {
          annotations.push({
            date: dates[index],
            text: 'Post-holiday slump',
            position: 'bottom',
            value: values[index]
          })
        }
      })
    }
    
    // Limit to max 4 annotations to avoid cluttering
    return annotations.slice(0, 4)
  }
  
  // Business context helper functions
  const getPercentChange = (value: number): string => {
    const absValue = Math.abs(value)
    const percentage = ((absValue / 1000) * 100).toFixed(1)
    return value >= 0 ? `+${percentage}%` : `-${percentage}%`
  }
  
  const getSeasonalTooltipContext = (month: number, value: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    
    if (month === 11) { // December
      return value > 0 
        ? `${months[month]} typically sees ${getPercentChange(value)} higher sales than trend due to holiday shopping.`
        : `Unusually, ${months[month]} is showing below-trend performance. This is contrary to holiday season expectations.`
    }
    
    if (month >= 5 && month <= 7) { // Summer months
      return value > 0 
        ? `${months[month]} typically sees ${getPercentChange(value)} higher sales than trend due to summer promotions.`
        : `${months[month]} is showing below-trend sales despite typical summer uptick.`
    }
    
    if (month >= 0 && month <= 1) { // January-February
      return value < 0 
        ? `${months[month]} typically sees ${getPercentChange(value)} lower sales than trend in post-holiday period.`
        : `${months[month]} is performing above trend, which is unusual for post-holiday period.`
    }
    
    return value > 0 
      ? `${months[month]} is ${getPercentChange(value)} above expected trend.`
      : `${months[month]} is ${getPercentChange(value)} below expected trend.`
  }
  
  // Generate business insights
  const generateInsights = (): BusinessInsight[] => {
    const chartType = getChartType(title)
    if (chartType !== 'seasonal' || !analysisData.seasonal) return []
    
    const insights: BusinessInsight[] = []
    const seasonalData = analysisData.seasonal
    const dates = seasonalData.map(point => new Date(point.period))
    const values = seasonalData.map(point => point.value)
    
    // Group data by year
    const yearlyData: Record<number, {dates: Date[], values: number[]}> = {}
    
    dates.forEach((date, index) => {
      const year = date.getFullYear()
      if (!yearlyData[year]) {
        yearlyData[year] = {dates: [], values: []}
      }
      yearlyData[year].dates.push(date)
      yearlyData[year].values.push(values[index])
    })
    
    const years = Object.keys(yearlyData).map(Number).sort()
    
    // Check for consistent patterns
    if (years.length > 1) {
      // Check summer months (Jun-Aug) across years
      const summerComparison = years.map(year => {
        const { dates, values } = yearlyData[year]
        const summerIndices = dates
          .map((date, index) => (date.getMonth() >= 5 && date.getMonth() <= 7) ? index : -1)
          .filter(index => index !== -1)
        
        const summerAvg = summerIndices.length > 0 
          ? summerIndices.reduce((sum, idx) => sum + values[idx], 0) / summerIndices.length
          : 0
          
        return { year, avg: summerAvg }
      })
      
      // If we have at least 2 years of data
      if (summerComparison.length >= 2) {
        const latestYear = summerComparison[summerComparison.length - 1]
        const previousYear = summerComparison[summerComparison.length - 2]
        
        if (latestYear.avg > previousYear.avg && latestYear.avg > 0) {
          insights.push({
            title: `Summer ${latestYear.year} Outperformed ${previousYear.year}`,
            description: `Summer months in ${latestYear.year} showed stronger seasonality than ${previousYear.year}, with approximately ${Math.round((latestYear.avg - previousYear.avg) / previousYear.avg * 100)}% improvement.`,
            type: 'positive'
          })
        } else if (latestYear.avg < previousYear.avg && previousYear.avg > 0) {
          insights.push({
            title: `Summer ${latestYear.year} Underperformed ${previousYear.year}`,
            description: `Summer months in ${latestYear.year} showed weaker seasonality than ${previousYear.year}, with approximately ${Math.round((previousYear.avg - latestYear.avg) / previousYear.avg * 100)}% decrease.`,
            type: 'negative'
          })
        }
      }
    }
    
    // Check for consistent patterns across all data
    const winterIndices = dates
      .map((date, index) => (date.getMonth() === 11 || date.getMonth() === 0) ? index : -1)
      .filter(index => index !== -1)
      
    const winterValues = winterIndices.map(idx => values[idx])
    const winterAvg = winterValues.reduce((sum, val) => sum + val, 0) / winterValues.length
    
    if (winterAvg > 0) {
      insights.push({
        title: "Strong Holiday Season Impact",
        description: "Holiday seasons consistently show significant positive impact on sales, averaging about " + getPercentChange(winterAvg) + " above trend.",
        type: 'info'
      })
    }
    
    // Look for anomalies
    const recentValues = values.slice(-6)
    const recentDates = dates.slice(-6)
    
    for (let i = 0; i < recentValues.length; i++) {
      const value = recentValues[i]
      const date = recentDates[i]
      const month = date.getMonth()
      const year = date.getFullYear()
      
      // Check if this month is significantly different from expected seasonal pattern
      const monthName = format(date, 'MMMM')
      
      // Find if we have the same month in previous years
      const sameMonthPreviousYears = dates
        .filter((d, idx) => d.getMonth() === month && d.getFullYear() < year)
        .map((d, idx) => values[dates.indexOf(d)])
      
      if (sameMonthPreviousYears.length > 0) {
        const avgPreviousYears = sameMonthPreviousYears.reduce((sum, val) => sum + val, 0) / sameMonthPreviousYears.length
        
        // If current value is very different from historical pattern
        if (value > 0 && avgPreviousYears < 0) {
          insights.push({
            title: `Unusual Growth in ${monthName} ${year}`,
            description: `${monthName} ${year} shows positive seasonality, unlike previous years which typically showed negative patterns.`,
            type: 'positive'
          })
        } else if (value < 0 && avgPreviousYears > 0) {
          insights.push({
            title: `Unexpected Decline in ${monthName} ${year}`,
            description: `${monthName} ${year} shows negative seasonality, unlike previous years which typically showed positive patterns.`,
            type: 'negative'
          })
        }
      }
    }
    
    // If we don't have enough insights, add a generic one
    if (insights.length === 0) {
      insights.push({
        title: "Seasonal Patterns Detected",
        description: "Clear seasonal patterns show consistent variations throughout the year. Holiday and summer seasons typically show positive impact.",
        type: 'info'
      })
    }
    
    return insights.slice(0, 3) // Return at most 3 insights
  }
  
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
    
    // Get annotations for storytelling
    const annotations = viewMode === 'story' ? getSeasonalAnnotations(dates, values) : []
    
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
        // Enhanced hover template for seasonal data with business context
        const seasonalHoverTemplate = (viewMode === 'story') ?
          '<b>%{x|%b %Y}</b><br>' +
          'Value: %{y:,.1f}<br>' +
          '<span>%{customdata}</span>' +
          '<extra></extra>' :
          '%{x|%b %Y}: %{y:,.1f}<extra></extra>'
          
        // Add custom data for hover template
        const customdata = dates.map((date, i) => 
          getSeasonalTooltipContext(date.getMonth(), values[i])
        )
        
        // For seasonal data, use a bar chart with color coding
        chartData.push({
          x: dates,
          y: values,
          type: 'bar',
          name: 'Seasonal',
          marker: {
            color: values.map(val => val >= 0 ? 
              (theme === 'light' ? '#10b981' : '#4ade80') : // Green for positive
              (theme === 'light' ? '#ef4444' : '#f87171')   // Red for negative
            ),
            opacity: 0.8,
          },
          customdata: customdata,
          hovertemplate: seasonalHoverTemplate
        })
        
        // If in story mode, highlight significant bars
        if (viewMode === 'story') {
          // Add a baseline at y=0
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
        }
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
      isMockData: !data || !sourceData, // Indicate if we're using mock data
      annotations,
      insights: chartType === 'seasonal' ? generateInsights() : [],
      chartType
    }
  }
  
  const { 
    chartData, 
    tickvals, 
    ticktext, 
    yaxisRange, 
    isMockData, 
    annotations,
    insights,
    chartType
  } = getChartData()
  
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
  
  // Create plot annotations from our semantic annotations
  const plotAnnotations = annotations.map((annotation, idx) => {
    const yPos = annotation.position === 'top' ? 
      annotation.value + Math.abs(annotation.value * 0.2) : 
      annotation.value - Math.abs(annotation.value * 0.2)
      
    return {
      x: annotation.date,
      y: yPos,
      text: annotation.text,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 1.5,
      arrowcolor: theme === 'light' ? '#64748b' : '#94a3b8',
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: 10,
        color: theme === 'light' ? '#0f172a' : '#f8fafc',
      },
      bgcolor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
      bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
      borderwidth: 1,
      borderpad: 4,
      ay: annotation.position === 'top' ? -30 : 30,
      ax: 0
    }
  })
  
  // Get subtitle text based on chart type
  const getSubtitleText = () => {
    if (chartType === 'seasonal') {
      return 'Positive values indicate sales above expected trend, negative values show below-trend performance'
    }
    if (chartType === 'residual') {
      return 'Unexplained variations after accounting for trend and seasonal patterns'
    }
    return ''
  }
  
  // Generate plot title with enhanced information
  const enhancedTitle = {
    text: `<b>${title}</b>` + (viewMode === 'story' && getSubtitleText() ? 
      `<br><span style="font-size: 11px; color: ${textColor}">${getSubtitleText()}</span>` : ''),
    font: {
      color: theme === 'light' ? '#0f172a' : '#f8fafc',
      family: 'Inter, system-ui, sans-serif',
      size: 16,
    },
    x: 0.01,
    xanchor: 'left',
    yanchor: 'top'
  }
  
  return (
    <div className="h-full w-full relative flex flex-col">
      {/* View mode toggle */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {/* Mock data indicator */}
        {isMockData && (
          <div className="px-2 py-1 bg-light-surface dark:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary text-xs rounded-md opacity-70">
            Sample Data
          </div>
        )}
        
        {/* Toggle between raw and story view */}
        <div className="flex bg-light-surface dark:bg-dark-surface rounded-md overflow-hidden border border-light-border dark:border-dark-border">
          <button 
            className={`px-2 py-1 text-xs ${viewMode === 'raw' ? 
              'bg-light-primary dark:bg-dark-primary text-white' : 
              'text-light-textSecondary dark:text-dark-textSecondary'}`}
            onClick={() => setViewMode('raw')}
          >
            Raw Data
          </button>
          <button 
            className={`px-2 py-1 text-xs ${viewMode === 'story' ? 
              'bg-light-primary dark:bg-dark-primary text-white' : 
              'text-light-textSecondary dark:text-dark-textSecondary'}`}
            onClick={() => setViewMode('story')}
          >
            Story View
          </button>
        </div>
      </div>
      
      <div className="flex-grow relative min-h-0">
        <Plot
          data={chartData}
          layout={{
            autosize: true,
            title: enhancedTitle,
            margin: { l: 50, r: 25, t: viewMode === 'story' ? 70 : 50, b: 50, pad: 4 },
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
              zeroline: true,
              zerolinecolor: theme === 'light' ? 'rgba(100,116,139,0.7)' : 'rgba(148,163,184,0.7)',
              zerolinewidth: 1.5,
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
            annotations: viewMode === 'story' ? plotAnnotations : [],
            shapes: viewMode === 'story' && selectedMonth ? [{
              type: 'rect',
              xref: 'x',
              yref: 'paper',
              x0: selectedMonth,
              x1: addMonths(selectedMonth, 1), 
              y0: 0,
              y1: 1,
              fillcolor: theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(96, 165, 250, 0.1)',
              opacity: 0.7,
              line: {
                width: 0
              }
            }] : [],
          }}
          config={{
            displayModeBar: false,
            responsive: true
          }}
          style={{ width: '100%', height: '100%' }}
          onClick={(data) => {
            if (data.points && data.points[0]) {
              const date = new Date(data.points[0].x)
              setSelectedMonth(date)
            }
          }}
        />
      </div>
      
      {/* Insights panel - only shown in story view and for seasonal data */}
      {viewMode === 'story' && chartType === 'seasonal' && insights.length > 0 && (
        <div className="mt-2 p-3 bg-light-surface dark:bg-dark-surface rounded-md border border-light-border dark:border-dark-border text-sm flex flex-col gap-2 max-h-32 overflow-y-auto">
          <h4 className="text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary">
            Analysis Insights
          </h4>
          
          {insights.map((insight, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="mt-0.5">
                {insight.type === 'positive' && (
                  <TrendingUp size={14} className="text-light-success dark:text-dark-success" />
                )}
                {insight.type === 'negative' && (
                  <TrendingDown size={14} className="text-light-danger dark:text-dark-danger" />
                )}
                {insight.type === 'info' && (
                  <Info size={14} className="text-light-info dark:text-dark-info" />
                )}
                {insight.type === 'neutral' && (
                  <AlertTriangle size={14} className="text-light-warning dark:text-dark-warning" />
                )}
              </div>
              <div>
                <div className="font-medium text-xs">{insight.title}</div>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
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