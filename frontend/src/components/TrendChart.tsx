import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint, Metric } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { format } from 'date-fns'

interface TrendChartProps {
  data: TrendDataPoint[]
  metric: Metric
  title: string
  onPointClick?: (point: TrendDataPoint) => void
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  metric,
  title,
  onPointClick
}) => {
  const { theme } = useTheme()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null)
  
  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Prepare colors for light/dark mode with improved contrast
  const lineColor = theme === 'light' ? '#3b82f6' : '#60a5fa'
  const gridColor = theme === 'light' ? 'rgba(226,232,240,0.6)' : 'rgba(51,65,85,0.6)'
  const textColor = theme === 'light' ? '#64748b' : '#94a3b8'
  const textColorDark = theme === 'light' ? '#0f172a' : '#f8fafc'
  const backgroundColor = 'rgba(0,0,0,0)'
  
  // Calculate appropriate tick frequency based on window width
  const getTickFrequency = (): number => {
    if (windowWidth < 640) return 6 // Show fewer ticks on small screens
    if (windowWidth < 1024) return 4
    return 2 // Show more ticks on larger screens
  }
  
  // Tooltip hover template with improved formatting
  const getHoverTemplate = (point: TrendDataPoint): string => {
    const formattedDate = formatDateLabel(new Date(point.period))
    const formattedValue = formatValue(point[metric])
    return `<b>${formattedDate}</b><br>${metric}: ${formattedValue}<extra></extra>`
  }
  
  // Format date labels for better readability
  const formatDateLabel = (date: Date): string => {
    return format(date, 'MMM d, yyyy')
  }
  
  // Format values with appropriate suffixes
  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(1)
  }
  
  // Enhanced color palette with better contrast for each metric
  const metricColors = {
    revenue: theme === 'light' ? '#6366f1' : '#818cf8', // Indigo
    units: theme === 'light' ? '#10b981' : '#4ade80',   // Emerald
    aov: theme === 'light' ? '#f59e0b' : '#fbbf24',     // Amber
    margin: theme === 'light' ? '#3b82f6' : '#60a5fa'   // Blue
  }
  
  // Accent color for trend line with improved visibility
  const accentColor = theme === 'light' ? '#06b6d4' : '#2dd4bf' // Cyan to Teal
  
  // Format numbers with K, M, B suffixes
  const formatNumber = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }
  
  // Enhanced tooltip with proper currency formatting
  const formatTooltip = (value: number): string => {
    if (metric === 'revenue' || metric === 'margin') {
      return `$${value.toLocaleString()}`
    } else if (metric === 'aov') {
      return `$${value.toFixed(2)}`
    } else {
      return value.toLocaleString()
    }
  }
  
  const handlePointClick = (event: any) => {
    if (onPointClick && event.points && event.points[0]) {
      const pointIndex = event.points[0].pointIndex
      setSelectedPointIndex(pointIndex)
      onPointClick(data[pointIndex])
    }
  }
  
  // Improved date formatting for various time periods
  const formatPeriod = (period: string): string => {
    if (period.includes('-')) {
      if (period.includes('Q')) {
        // Quarterly data
        const [year, quarter] = period.split('-Q')
        return `Q${quarter} '${year.slice(2)}`
      } else if (period.includes('W')) {
        // Weekly data
        const [year, week] = period.split('-W')
        return `W${week} '${year.slice(2)}`
      } else {
        // Monthly data
        try {
          const date = new Date(period + '-01')
          return format(date, "MMM ''yy") // Improved month year format
        } catch (e) {
          return period
        }
      }
    } else {
      // Annual data
      return `'${period.slice(2)}`
    }
  }
  
  // Determine which periods to show labels for
  const filterVisibleLabels = () => {
    const frequency = getTickFrequency()
    return data.map((d, i) => i % frequency === 0)
  }
  
  // Create visible ticks array based on screen size
  const visibleTicks = filterVisibleLabels()
  const tickvals = data.map((d, i) => visibleTicks[i] ? d.period : null).filter(Boolean)
  const ticktext = tickvals.map(period => period ? formatPeriod(period as string) : '')
  
  // Enhanced tooltip templates with better currency formatting and typography
  const tooltipTemplate = (metric === 'revenue' || metric === 'margin' || metric === 'aov') 
    ? '<b>%{x}</b><br>' + 
      `${metric.charAt(0).toUpperCase() + metric.slice(1)}: $%{y:,.2f}<br>` +
      '<extra></extra>'
    : '<b>%{x}</b><br>' + 
      `${metric.charAt(0).toUpperCase() + metric.slice(1)}: %{y:,}<br>` +
      '<extra></extra>'
  
  const trendTooltipTemplate = 
    '<b>%{x}</b><br>' + 
    'Trend: ' + (metric === 'revenue' || metric === 'margin' || metric === 'aov' ? '$%{y:,.2f}' : '%{y:,}') +
    '<extra></extra>'
  
  return (
    <div className="h-80 w-full">
      <Plot
        data={[
          {
            x: data.map(d => d.period),
            y: data.map(d => d[metric]),
            type: 'scatter',
            mode: 'lines+markers',
            name: title,
            line: {
              color: metricColors[metric],
              width: 3,
              shape: 'spline', // Smooth lines for better appearance
            },
            marker: {
              color: metricColors[metric],
              size: 8,
              line: {
                color: theme === 'light' ? '#ffffff' : '#1e293b',
                width: 2
              }
            },
            hovertemplate: tooltipTemplate,
          },
          {
            x: data.map(d => d.period),
            y: data.map(d => d.trend),
            type: 'scatter',
            mode: 'lines',
            name: 'Trend Line',
            line: {
              color: accentColor,
              width: 2.5, // Slightly thicker for better visibility
              dash: 'dash',
              shape: 'spline', // Smooth lines for better appearance
            },
            hovertemplate: trendTooltipTemplate,
          },
        ]}
        layout={{
          autosize: true,
          title: {
            text: title,
            font: {
              color: textColorDark,
              family: 'Inter, system-ui, sans-serif',
              size: 18, 
              weight: 600,
            },
            x: 0.01,
            xanchor: 'left', 
            yanchor: 'top',
            pad: { t: 10, b: 14 } // Improved padding for title
          },
          margin: { l: 58, r: 25, t: 50, b: 55, pad: 4 }, // Adjusted margins for better balance
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
            tickangle: -30, // Angled text for better readability
            tickfont: {
              family: 'Inter, system-ui, sans-serif',
              size: 12, // Slightly larger for better readability
              color: textColor
            },
            tickformat: '%b %d',
            tickmode: 'array',
            nticks: 5,
            fixedrange: true,
            title: {
              text: '', // No x-axis title needed
              standoff: 10,
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12,
                color: textColor
              }
            },
          },
          yaxis: {
            showgrid: true,
            gridcolor: gridColor,
            gridwidth: 0.5,
            zeroline: false,
            tickfont: {
              family: 'Inter, system-ui, sans-serif',
              size: 12, // Slightly larger for better readability
              color: textColor
            },
            fixedrange: true,
            tickformat: ',~s', // Smart number formatting
            hoverformat: ',.1f',
            automargin: true,
            title: {
              text: metric.charAt(0).toUpperCase() + metric.slice(1),
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 14, // Larger for better visibility
                color: textColor
              },
              standoff: 15 // More standoff for better spacing
            }
          },
          hovermode: 'closest',
          hoverlabel: {
            bgcolor: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,41,59,0.95)',
            bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 13,
              color: textColorDark,
            },
            align: 'left'
          },
          dragmode: false,
          annotations: selectedPointIndex !== null ? [
            {
              x: data[selectedPointIndex].period,
              y: data[selectedPointIndex][metric],
              xref: 'x',
              yref: 'y',
              text: formatValue(data[selectedPointIndex][metric]),
              showarrow: true,
              arrowhead: 4,
              arrowsize: 1,
              arrowwidth: 2,
              arrowcolor: lineColor,
              ax: 0,
              ay: -40,
              bordercolor: theme === 'light' ? '#e2e8f0' : '#334155',
              borderwidth: 1,
              borderpad: 4,
              bgcolor: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,41,59,0.95)',
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12,
                color: textColorDark
              }
            }
          ] : [],
        }}
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: [
            'select2d',
            'lasso2d',
            'autoScale2d',
            'toggleSpikelines',
          ],
          responsive: true,
          toImageButtonOptions: {
            format: 'png',
            filename: `${title.toLowerCase().replace(/\s+/g, '_')}`,
            height: 500,
            width: 700,
            scale: 2
          }
        }}
        style={{ width: '100%', height: '100%' }}
        onClick={onPointClick ? handlePointClick : undefined}
        className="chart-container"
      />
    </div>
  )
} 