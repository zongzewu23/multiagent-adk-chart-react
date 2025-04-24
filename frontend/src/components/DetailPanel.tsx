import React from 'react'
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Plot from 'react-plotly.js'
import { DetailSelection, Metric, TrendDataPoint, TopPerformer } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { format } from 'date-fns'
import { CustomScrollbar } from './CustomScrollbar'

interface DetailPanelProps {
  detail: DetailSelection
  metric: Metric
  trendData: TrendDataPoint[]
  onClose: () => void
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  detail,
  metric,
  trendData,
  onClose
}) => {
  const { theme } = useTheme()
  
  const formatValue = (value: number): string => {
    if (metric === 'revenue' || metric === 'margin') {
      return `$${value.toLocaleString()}`
    } else if (metric === 'aov') {
      return `$${value.toFixed(2)}`
    } else {
      return value.toLocaleString()
    }
  }
  
  // Format period for display
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
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    } else {
      // Annual data
      return period
    }
  }
  
  // Rendering for period detail
  const renderPeriodDetail = () => {
    if (!detail.data) return null
    
    const { data } = detail
    
    return (
      <div>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {(['revenue', 'units', 'aov', 'margin'] as Metric[]).map(m => (
              <div key={m} className={`bg-light-surfaceHover dark:bg-dark-surfaceHover p-3 rounded-lg ${m === metric ? 'ring-1 ring-light-primary dark:ring-dark-primary' : ''}`}>
                <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary capitalize">{m}</div>
                <div className="text-lg font-bold mt-1 text-light-text dark:text-dark-text">
                  {formatValue(data[m])}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-2">Time Series Components</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-light-text dark:text-dark-text">Trend</span>
              <span className="font-medium text-light-text dark:text-dark-text">{formatValue(data.trend)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-text dark:text-dark-text">Seasonal</span>
              <span className="font-medium text-light-text dark:text-dark-text">{formatValue(data.seasonal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-text dark:text-dark-text">Residual</span>
              <span className="font-medium text-light-text dark:text-dark-text">{formatValue(data.residual)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Rendering for dimension item detail
  const renderDimensionDetail = () => {
    if (!detail.item) return null
    
    const { item } = detail
    const isPositiveGrowth = (item.growth || 0) >= 0
    
    // Get trend data for this item (in reality, this would be specific to the dimension item)
    // Here we're just reusing the overall trend as an example
    const itemTrendData = trendData.slice(-6).map(d => d[metric])
    
    const metricColor = theme === 'light' 
      ? metric === 'revenue' ? '#6366f1' : 
        metric === 'units' ? '#10b981' : 
        metric === 'aov' ? '#f59e0b' : '#3b82f6'
      : metric === 'revenue' ? '#818cf8' : 
        metric === 'units' ? '#4ade80' : 
        metric === 'aov' ? '#fbbf24' : '#60a5fa'
    
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Total {metric}
            </div>
            <div className="font-bold text-light-text dark:text-dark-text">
              {formatValue(item.value)}
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Share of total
            </div>
            <div className="font-bold text-light-text dark:text-dark-text">
              {item.share.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="h-32 mb-4">
          <Plot
            data={[
              {
                x: Array.from({ length: itemTrendData.length }, (_, i) => i),
                y: itemTrendData,
                type: 'scatter',
                mode: 'lines',
                line: {
                  color: metricColor,
                  width: 2,
                },
                hoverinfo: 'none',
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 10, r: 10, t: 10, b: 10, pad: 0 },
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
        
        <div className="p-3 bg-light-surfaceHover dark:bg-dark-surfaceHover rounded-lg">
          <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">
            Growth (YoY)
          </div>
          <div className="flex items-center">
            {isPositiveGrowth ? (
              <>
                <ArrowUpRight size={18} className="text-light-success dark:text-dark-success mr-1" />
                <span className="text-lg font-bold text-light-success dark:text-dark-success">
                  +{(item.growth || 0).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <ArrowDownRight size={18} className="text-light-danger dark:text-dark-danger mr-1" />
                <span className="text-lg font-bold text-light-danger dark:text-dark-danger">
                  {(item.growth || 0).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-80 bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border transition-all duration-300">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
        <h3 className="font-bold text-light-text dark:text-dark-text">
          {detail.type === 'period' && detail.period
            ? formatPeriod(detail.period)
            : detail.type === 'dimension' && detail.item
              ? `${detail.item.name} Details`
              : 'Details'
          }
        </h3>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-light-surfaceHover dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
        >
          <X size={18} className="text-light-textSecondary dark:text-dark-textSecondary" />
        </button>
      </div>
      
      <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
        {detail.type === 'period' ? renderPeriodDetail() : renderDimensionDetail()}
      </div>
    </div>
  )
} 