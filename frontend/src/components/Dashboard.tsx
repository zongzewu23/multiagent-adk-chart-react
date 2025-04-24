import React from 'react'
import { Filter, BarChart3, PieChart as PieChartIcon, TrendingUp, LayoutGrid, Settings } from 'lucide-react'
import { useDashboardStore } from '../store/dashboardStore'
import { ThemeToggle } from './ThemeToggle'
import { KPICard } from './KPICard'
import { TrendChart } from './TrendChart'
import { BreakdownChart } from './BreakdownChart'
import { ComponentAnalysisChart } from './ComponentAnalysisChart'
import { FilterPanel } from './FilterPanel'
import { DetailPanel } from './DetailPanel'
import { Metric, TimePeriod, Dimension, DetailSelection } from '../types'

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
  
  return (
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
        <main className="flex-grow p-6 overflow-y-auto">
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
              <div className="flex items-center px-4 py-2 space-x-2">
                <span className="text-light-textSecondary dark:text-dark-textSecondary">Dimension:</span>
                <select
                  value={selectedDimension || 'product'}
                  onChange={(e) => setSelectedDimension(e.target.value as Dimension)}
                  className="appearance-none bg-transparent border-none text-light-text dark:text-dark-text focus:outline-none pr-8"
                >
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                  <option value="channel">Channel</option>
                  <option value="region">Region</option>
                  <option value="customer">Customer</option>
                </select>
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
                />
              )
            })}
          </div>
          
          {/* Main trend chart */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 mb-6 shadow-sm glass-panel">
            <TrendChart
              data={trendData}
              metric={selectedMetric}
              title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend Analysis`}
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
                data={trendData}
                title="Seasonality & Residual Analysis"
              />
            </div>
          </div>
        </main>
        
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
  )
} 