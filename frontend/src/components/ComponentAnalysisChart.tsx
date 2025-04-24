import React from 'react'
import Plot from 'react-plotly.js'
import { TrendDataPoint } from '../types'
import { useTheme } from '../contexts/ThemeContext'

interface ComponentAnalysisChartProps {
  data: TrendDataPoint[]
  title: string
}

export const ComponentAnalysisChart: React.FC<ComponentAnalysisChartProps> = ({
  data,
  title
}) => {
  const { theme } = useTheme()
  
  const colors = {
    seasonal: theme === 'light' ? '#f59e0b' : '#fbbf24',
    residual: theme === 'light' ? '#a855f7' : '#c084fc',
    textColor: theme === 'light' ? '#64748b' : '#94a3b8',
    gridColor: theme === 'light' ? '#e2e8f0' : '#334155',
    backgroundColor: 'rgba(0,0,0,0)'
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
    <div className="h-full w-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
          {title}
        </h3>
      </div>
      
      {/* Seasonal Component Chart */}
      <div className="h-1/2 mb-4">
        <Plot
          data={[
            {
              x: data.map(d => d.period),
              y: data.map(d => d.seasonal),
              type: 'bar',
              name: 'Seasonal Component',
              marker: {
                color: colors.seasonal,
              },
              hovertemplate: '%{y:,.2f}<extra>Seasonal</extra>',
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 40, r: 20, t: 30, b: 30 },
            title: {
              text: 'Seasonal Component',
              font: {
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                size: 14,
              },
            },
            xaxis: {
              tickvals: data.map(d => d.period).filter((_, i) => i % 3 === 0),
              ticktext: data.map(d => formatPeriod(d.period)).filter((_, i) => i % 3 === 0),
              gridcolor: colors.gridColor,
              tickfont: {
                color: colors.textColor,
                size: 10
              },
            },
            yaxis: {
              gridcolor: colors.gridColor,
              zerolinecolor: colors.gridColor,
              tickfont: {
                color: colors.textColor,
                size: 10
              },
            },
            paper_bgcolor: colors.backgroundColor,
            plot_bgcolor: colors.backgroundColor,
            showlegend: false,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Residual Component Chart */}
      <div className="h-1/2">
        <Plot
          data={[
            {
              x: data.map(d => d.period),
              y: data.map(d => d.residual),
              type: 'scatter',
              mode: 'markers',
              name: 'Residual Component',
              marker: {
                color: colors.residual,
                size: 8,
              },
              hovertemplate: '%{y:,.2f}<extra>Residual</extra>',
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 40, r: 20, t: 30, b: 30 },
            title: {
              text: 'Residual Analysis',
              font: {
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                size: 14,
              },
            },
            xaxis: {
              tickvals: data.map(d => d.period).filter((_, i) => i % 3 === 0),
              ticktext: data.map(d => formatPeriod(d.period)).filter((_, i) => i % 3 === 0),
              gridcolor: colors.gridColor,
              tickfont: {
                color: colors.textColor,
                size: 10
              },
            },
            yaxis: {
              gridcolor: colors.gridColor,
              zerolinecolor: colors.gridColor,
              tickfont: {
                color: colors.textColor,
                size: 10
              },
              zeroline: true,
              zerolinewidth: 2,
            },
            paper_bgcolor: colors.backgroundColor,
            plot_bgcolor: colors.backgroundColor,
            showlegend: false,
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