import React from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint, Metric } from '../types'
import { useTheme } from '../contexts/ThemeContext'

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
  
  const metricColors = {
    revenue: theme === 'light' ? '#6366f1' : '#818cf8',
    units: theme === 'light' ? '#10b981' : '#4ade80',
    aov: theme === 'light' ? '#f59e0b' : '#fbbf24',
    margin: theme === 'light' ? '#3b82f6' : '#60a5fa'
  }
  
  const accentColor = theme === 'light' ? '#22d3ee' : '#34d399'
  const gridColor = theme === 'light' ? '#e2e8f0' : '#334155'
  const textColor = theme === 'light' ? '#64748b' : '#94a3b8'
  const backgroundColor = 'rgba(0,0,0,0)'
  
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
      onPointClick(data[pointIndex])
    }
  }
  
  const formatPeriod = (period: string): string => {
    if (period.includes('-')) {
      if (period.includes('Q')) {
        // Quarterly data
        const [year, quarter] = period.split('-Q')
        return `Q${quarter} ${year}`
      } else if (period.includes('W')) {
        // Weekly data
        const [year, week] = period.split('-W')
        return `Week ${week}, ${year}`
      } else {
        // Monthly data
        const date = new Date(period + '-01')
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
    } else {
      // Annual data
      return period
    }
  }
  
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
            },
            marker: {
              color: metricColors[metric],
              size: 8,
              line: {
                color: theme === 'light' ? '#ffffff' : '#1e293b',
                width: 2
              }
            },
            hovertemplate: '%{y:,.2f}<extra></extra>',
          },
          {
            x: data.map(d => d.period),
            y: data.map(d => d.trend),
            type: 'scatter',
            mode: 'lines',
            name: 'Trend Line',
            line: {
              color: accentColor,
              width: 2,
              dash: 'dash',
            },
            hovertemplate: '%{y:,.2f}<extra>Trend</extra>',
          },
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
          margin: { l: 50, r: 30, t: 50, b: 50 },
          xaxis: {
            tickvals: data.map(d => d.period),
            ticktext: data.map(d => formatPeriod(d.period)),
            tickangle: -45,
            gridcolor: gridColor,
            linecolor: gridColor,
            title: {
              text: 'Period',
              font: {
                color: textColor,
              },
            },
            tickfont: {
              color: textColor,
            },
            fixedrange: false,
          },
          yaxis: {
            gridcolor: gridColor,
            zerolinecolor: gridColor,
            title: {
              text: metric.charAt(0).toUpperCase() + metric.slice(1),
              font: {
                color: textColor,
              },
            },
            tickfont: {
              color: textColor,
            },
            fixedrange: false,
            tickformat: metric === 'revenue' || metric === 'margin' || metric === 'aov' ? '$,.2f' : ',',
          },
          paper_bgcolor: backgroundColor,
          plot_bgcolor: backgroundColor,
          showlegend: true,
          legend: {
            orientation: 'h',
            x: 0.5,
            y: 1.1,
            xanchor: 'center',
            font: {
              color: textColor,
            },
          },
          hovermode: 'closest',
          dragmode: 'zoom',
          clickmode: 'event',
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
        }}
        style={{ width: '100%', height: '100%' }}
        onClick={onPointClick ? handlePointClick : undefined}
      />
    </div>
  )
} 