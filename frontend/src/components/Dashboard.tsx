import React from 'react'
import { Filter, BarChart3, PieChart as PieChartIcon, TrendingUp, LayoutGrid, Settings, Info, Lightbulb } from 'lucide-react'
import { useDashboardStore } from '../store/dashboardStore'
import { ThemeToggle } from './ThemeToggle'
import { KPICard } from './KPICard'
import { TrendChart } from './TrendChart'
import { BreakdownChart } from './BreakdownChart'
import { ComponentAnalysisChart } from './ComponentAnalysisChart'
import { FilterPanel } from './FilterPanel'
import { DetailPanel } from './DetailPanel'
import { StyledDropdown } from './StyledDropdown'
import { Metric, TimePeriod, Dimension, DetailSelection, TimeFilter } from '../types'

// Create a component to inject global styles
const GlobalStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Enhanced tooltip animation */
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
        
        /* Custom scrollbar for modern browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.2);
          border-radius: 6px;
          margin: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 6px;
          transition: background 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.4) rgba(30, 41, 59, 0.2);
        }
        
        /* Apply smooth animation to hoverlabel for all charts */
        .js-plotly-plot .plotly .hoverlabel {
          transition: opacity 0.3s ease, transform 0.3s ease !important;
          opacity: 0;
          transform: translateY(10px);
          animation: tooltipFadeIn 0.3s ease forwards;
        }
      `
    }} />
  )
}

export const Dashboard: React.FC = () => {
  const {
    selectedTimePeriod,
    selectedMetric,
    selectedDimension,
    isFilterPanelOpen,
    selectedDetail,
    filters,
    trendData,
    dimensionalBreakdown,
    overallMetrics,
    setSelectedTimePeriod,
    setSelectedMetric,
    setSelectedDimension,
    toggleFilterPanel,
    setSelectedDetail,
    updateFilters,
    refreshData
  } = useDashboardStore()
  
  // Handler for KPI card click
  const handleMetricCardClick = (metric: Metric) => {
    setSelectedMetric(metric)
  }
  
  // Handler for trend point click (drill down to period)
  const handleTrendPointClick = (point: any) => {
    setSelectedDetail({
      type: 'period',
      period: point.period,
      data: point
    })
  }
  
  // Handler for dimension item click (drill down to dimension)
  const handleDimensionItemClick = (item: any) => {
    setSelectedDetail({
      type: 'dimension',
      dimension: selectedDimension,
      item
    })
  }
  
  // Close detail panel
  const closeDetailPanel = () => {
    setSelectedDetail(null)
  }
  
  // Apply filters
  const applyFilters = () => {
    refreshData()
    toggleFilterPanel()
  }
  
  // Reset filters
  const resetFilters = () => {
    updateFilters({
      startDate: null,
      endDate: null,
      selectedCategories: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'],
      selectedChannels: ['Online', 'Retail Stores', 'Wholesale', 'Marketplace'],
      selectedRegions: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'],
      selectedProducts: []
    })
  }
  
  // Get metric icon
  const getMetricIcon = (metric: Metric) => {
    switch(metric) {
      case 'revenue': return <TrendingUp size={20} />
      case 'units': return <BarChart3 size={20} />
      case 'aov': return <PieChartIcon size={20} />
      case 'margin': return <LayoutGrid size={20} />
      default: return <TrendingUp size={20} />
    }
  }
  
  // Get last 6 data points for sparklines
  const getSparklineData = (metric: Metric) => {
    return trendData.slice(-6).map(d => d[metric])
  }
  
  // Map time period to TimeFilter type
  const getTimeFilter = (): TimeFilter => {
    switch(selectedTimePeriod) {
      case 'daily': return 'last7days'
      case 'weekly': return 'last30days'
      case 'monthly': return 'last90days'
      case 'quarterly': return 'ytd'
      case 'annual': return 'lastYear'
      default: return 'last30days'
    }
  }
  
  return (
    <>
      <GlobalStyles />
      <div className="flex flex-col h-screen w-full bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text transition-colors duration-300">
        {/* Header */}
        <header className="px-6 py-4 flex justify-between items-center glass-panel border-b border-light-border dark:border-dark-border">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary">
                Sales Trend Analyzer
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleFilterPanel}
              className="px-4 py-2 flex items-center space-x-2 rounded-lg bg-light-surfaceHover dark:bg-dark-surfaceHover hover:bg-opacity-80 transition-all"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            <ThemeToggle />
            <button className="p-2 rounded-lg bg-light-surfaceHover dark:bg-dark-surfaceHover hover:bg-opacity-80 transition-all">
              <Settings size={18} />
            </button>
          </div>
        </header>
        
        {/* Main content area */}
        <div className="flex-grow flex overflow-hidden">
          {/* Main dashboard content */}
          <div className="flex-grow flex overflow-hidden">
            <div className="w-full h-full overflow-auto">
              <main className="flex-grow p-6">
                {/* Control bar */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center bg-light-surface dark:bg-dark-surface rounded-lg p-1 shadow-sm">
                    {(['daily', 'weekly', 'monthly', 'quarterly', 'annual'] as TimePeriod[]).map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedTimePeriod(period)}
                        className={`px-4 py-2 rounded-md transition-all ${
                          selectedTimePeriod === period 
                            ? 'bg-light-primary dark:bg-dark-primary text-white' 
                            : 'text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center bg-light-surface dark:bg-dark-surface rounded-lg p-1 ml-auto shadow-sm">
                    <div className="flex items-center px-4 py-2">
                      <StyledDropdown
                        label="Dimension"
                        value={selectedDimension || 'product'}
                        onChange={(value) => setSelectedDimension(value as Dimension)}
                        options={[
                          { value: 'product', label: 'Product' },
                          { value: 'category', label: 'Category' },
                          { value: 'channel', label: 'Channel' },
                          { value: 'region', label: 'Region' },
                          { value: 'customer', label: 'Customer' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Metrics cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {(['revenue', 'units', 'aov', 'margin'] as Metric[]).map(metric => {
                    // Get the appropriate values based on the metric
                    const totalValue = metric === 'revenue' ? overallMetrics.totalRevenue :
                                      metric === 'units' ? overallMetrics.totalUnits :
                                      metric === 'aov' ? overallMetrics.avgAov :
                                      overallMetrics.avgMargin;
                    
                    const growthValue = metric === 'revenue' ? overallMetrics.revenueGrowth :
                                      metric === 'units' ? overallMetrics.unitGrowth :
                                      metric === 'aov' ? overallMetrics.aovGrowth :
                                      overallMetrics.marginGrowth;
                    
                    const metricDescription = metric === 'revenue' ? 'Total sales value before returns and discounts' : 
                                          metric === 'units' ? 'Number of individual items sold across all channels' : 
                                          metric === 'aov' ? 'Average transaction value per order' : 
                                          'Profit percentage after cost of goods sold';
                    
                    return (
                      <KPICard
                        key={metric}
                        title={metric}
                        value={totalValue}
                        growth={growthValue}
                        sparklineData={getSparklineData(metric)}
                        icon={getMetricIcon(metric)}
                        metric={metric}
                        isSelected={selectedMetric === metric}
                        onClick={handleMetricCardClick}
                        description={metricDescription}
                      />
                    )
                  })}
                </div>
                
                {/* Dynamic Insights Above Chart */}
                <div className="mb-4 p-3 bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-lg text-sm animate-fadeIn">
                  <div className="flex items-start">
                    <Lightbulb size={16} className="text-light-warning dark:text-dark-warning mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Key Insight:</span>
                      {selectedMetric === 'revenue' ? 
                        ' Revenue shows strong seasonal patterns with peaks in Q4, indicating holiday shopping impact.' :
                        selectedMetric === 'units' ? 
                        ' Unit sales volume is growing steadily, with 7% higher average in 2024 vs 2023.' :
                        selectedMetric === 'aov' ? 
                        ' Average order value has increased during promotional periods but remains stable overall.' :
                        ' Profit margins have improved steadily throughout 2023-2024, suggesting better cost control.'}
                    </div>
                  </div>
                </div>
                
                {/* Main trend chart */}
                <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 mb-6 shadow-sm glass-panel">
                  <TrendChart
                    data={trendData}
                    metric={selectedMetric}
                    timeFilter={getTimeFilter()}
                    title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend Analysis`}
                    subtitle="Tracking performance over time with seasonality and trend components"
                    onPointClick={handleTrendPointClick}
                  />
                </div>
                
                {/* Bottom row - Dimensional Analysis & Seasonality */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top performers by dimension */}
                  <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 shadow-sm glass-panel h-[500px]">
                    {selectedDimension && (
                      <BreakdownChart
                        data={dimensionalBreakdown[selectedDimension] || []}
                        metric={selectedMetric}
                        dimension={selectedDimension}
                        title={`Top ${selectedDimension.charAt(0).toUpperCase() + selectedDimension.slice(1)}s by ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
                        onItemClick={handleDimensionItemClick}
                      />
                    )}
                  </div>
                  
                  {/* Seasonality analysis */}
                  <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 shadow-sm glass-panel h-[500px]">
                    <ComponentAnalysisChart
                      data={{
                        trend: trendData.map(point => ({ 
                          period: point.date.toISOString().split('T')[0], 
                          value: point[selectedMetric] 
                        })),
                        seasonal: trendData.map(point => ({ 
                          period: point.date.toISOString().split('T')[0], 
                          value: point[selectedMetric] * 0.2 * Math.sin((new Date(point.date).getMonth() / 12) * Math.PI * 2) 
                        })),
                        residual: trendData.map(point => ({ 
                          period: point.date.toISOString().split('T')[0], 
                          value: (Math.random() - 0.5) * point[selectedMetric] * 0.1 
                        }))
                      }}
                      title="Seasonality & Residual Analysis"
                    />
                  </div>
                </div>
              </main>
            </div>

            {/* Side panels container */}
            <div className="relative">
              {/* Detail panel */}
              {selectedDetail && (
                <DetailPanel
                  detail={selectedDetail}
                  metric={selectedMetric}
                  trendData={trendData}
                  onClose={closeDetailPanel}
                />
              )}
              
              {/* Filter panel */}
              <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={toggleFilterPanel}
                filters={filters}
                onUpdateFilters={updateFilters}
                onApplyFilters={applyFilters}
                onResetFilters={resetFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 