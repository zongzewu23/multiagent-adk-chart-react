import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, Scatter, ZAxis, Cell, PieChart, Pie } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Filter, BarChart3, PieChart, TrendingUp, Calendar, Layers, ChevronDown, X, Settings } from 'lucide-react';
import _ from 'lodash';

// Mock Data (to be replaced with API calls to your Python backend)
const generateMockData = () => {
  const metrics = ['revenue', 'units', 'aov', 'margin'];
  const dimensions = ['product', 'category', 'channel', 'region'];
  const periods = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];
  
  // Generate 24 months of data
  const trendData = [];
  let baseValue = 10000;
  const startDate = new Date(2023, 0, 1);
  
  for (let i = 0; i < 24; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i);
    
    // Add some seasonality and trend
    const seasonality = 1 + 0.3 * Math.sin((i / 12) * Math.PI * 2);
    const trend = 1 + 0.01 * i;
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    const value = baseValue * seasonality * trend * randomFactor;
    
    trendData.push({
      period: currentDate.toISOString().slice(0, 7),
      revenue: Math.round(value),
      units: Math.round(value / 50),
      aov: Math.round(value / (value / 50)),
      margin: Math.round(value * 0.3),
      trend: Math.round(value * trend),
      seasonal: Math.round(value * seasonality),
      residual: Math.round(value * (randomFactor - 1)),
    });
  }
  
  // Top performers by dimension
  const topPerformersByDimension = {};
  dimensions.forEach(dimension => {
    const performers = [];
    for (let i = 0; i < 5; i++) {
      performers.push({
        id: `${dimension}_${i+1}`,
        name: `${dimension.charAt(0).toUpperCase() + dimension.slice(1)} ${i+1}`,
        value: Math.round(baseValue * (5-i) * (0.8 + Math.random() * 0.4)),
        share: (5-i) * 5 + Math.random() * 5
      });
    }
    topPerformersByDimension[dimension] = performers;
  });
  
  // Overall metrics
  const overallMetrics = {
    totalRevenue: trendData.reduce((sum, item) => sum + item.revenue, 0),
    totalUnits: trendData.reduce((sum, item) => sum + item.units, 0),
    avgAov: trendData.reduce((sum, item) => sum + item.aov, 0) / trendData.length,
    avgMargin: trendData.reduce((sum, item) => sum + item.margin, 0) / trendData.length,
    revenueGrowth: 12.5,
    unitGrowth: 8.3,
    aovGrowth: 3.9,
    marginGrowth: 14.7
  };
  
  return { trendData, topPerformersByDimension, overallMetrics };
};

const { trendData, topPerformersByDimension, overallMetrics } = generateMockData();

// Color schemes
const colors = {
  primary: '#6366f1',
  secondary: '#a855f7',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  brightAccent: '#22d3ee',
  gradientStart: '#6366f1',
  gradientEnd: '#a855f7'
};

const metricColors = {
  revenue: colors.primary,
  units: colors.success,
  aov: colors.warning,
  margin: colors.info
};

const metricIcons = {
  revenue: <TrendingUp size={20} />,
  units: <BarChart3 size={20} />,
  aov: <PieChart size={20} />,
  margin: <Layers size={20} />
};

// Main Dashboard Component
const SalesTrendDashboard = () => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedDimension, setSelectedDimension] = useState('product');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  // Function to handle metric card click (drill down)
  const handleMetricCardClick = (metric) => {
    setSelectedMetric(metric);
  };
  
  // Function to handle trend point click (drill down to specific period)
  const handleTrendPointClick = (data) => {
    setSelectedDetail({
      type: 'period',
      period: data.period,
      data: data
    });
  };
  
  // Function to handle dimension item click (drill down to specific dimension)
  const handleDimensionItemClick = (dimension, item) => {
    setSelectedDetail({
      type: 'dimension',
      dimension: dimension,
      item: item
    });
  };
  
  // Close detail panel
  const closeDetailPanel = () => {
    setSelectedDetail(null);
  };
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-background to-surface text-text overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-surface bg-opacity-70 border-b border-surfaceLight">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-text flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradientStart to-gradientEnd">
              Sales Trend Analyzer
            </span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleFilterPanel}
            className="px-4 py-2 flex items-center space-x-2 rounded-lg bg-surfaceLight hover:bg-opacity-80 transition-all"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="p-2 rounded-lg bg-surfaceLight hover:bg-opacity-80 transition-all">
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
            <div className="flex items-center bg-surface rounded-lg p-1">
              {['daily', 'weekly', 'monthly', 'quarterly', 'annual'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTimePeriod(period)}
                  className={`px-4 py-2 rounded-md transition-all ${
                    selectedTimePeriod === period 
                      ? 'bg-primary text-white' 
                      : 'text-textSecondary hover:text-text'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center bg-surface rounded-lg p-1 ml-auto">
              <div className="flex items-center px-4 py-2 space-x-2">
                <span className="text-textSecondary">Dimension:</span>
                <div className="relative">
                  <select
                    value={selectedDimension}
                    onChange={(e) => setSelectedDimension(e.target.value)}
                    className="appearance-none bg-transparent border-none text-text focus:outline-none pr-8"
                  >
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                    <option value="channel">Channel</option>
                    <option value="region">Region</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-textSecondary pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {['revenue', 'units', 'aov', 'margin'].map(metric => {
              // Get the appropriate values based on the metric
              const totalValue = metric === 'revenue' ? overallMetrics.totalRevenue :
                                 metric === 'units' ? overallMetrics.totalUnits :
                                 metric === 'aov' ? overallMetrics.avgAov :
                                 overallMetrics.avgMargin;
              
              const growthValue = metric === 'revenue' ? overallMetrics.revenueGrowth :
                                 metric === 'units' ? overallMetrics.unitGrowth :
                                 metric === 'aov' ? overallMetrics.aovGrowth :
                                 overallMetrics.marginGrowth;
              
              const isPositiveGrowth = growthValue >= 0;
              
              return (
                <div 
                  key={metric}
                  onClick={() => handleMetricCardClick(metric)}
                  className={`bg-surface rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/20 ${
                    selectedMetric === metric ? 'ring-1 ring-brightAccent shadow-lg shadow-brightAccent/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${metricColors[metric]}20` }}
                      >
                        {metricIcons[metric]}
                      </div>
                      <h3 className="text-textSecondary font-medium capitalize">
                        {metric}
                      </h3>
                    </div>
                    
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                      isPositiveGrowth ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {isPositiveGrowth ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>{Math.abs(growthValue).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h2 className="text-2xl font-bold">
                      {metric === 'revenue' || metric === 'margin' 
                        ? `$${(totalValue / 1000).toFixed(1)}K` 
                        : metric === 'aov' 
                          ? `$${totalValue.toFixed(2)}`
                          : totalValue.toLocaleString()}
                    </h2>
                    <div className="h-8 mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData.slice(-6)}>
                          <Line 
                            type="monotone" 
                            dataKey={metric} 
                            stroke={metricColors[metric]} 
                            strokeWidth={2} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Main trend chart */}
          <div className="bg-surface rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend Analysis
              </h2>
              <div className="flex space-x-2">
                {/* Add buttons for different chart types if needed */}
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.surfaceLight} />
                  <XAxis 
                    dataKey="period" 
                    stroke={colors.textSecondary}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis stroke={colors.textSecondary} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.surface, 
                      borderColor: colors.surfaceLight,
                      color: colors.text 
                    }}
                    labelStyle={{ color: colors.text }}
                    formatter={(value) => [`${value.toLocaleString()}`, selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)]}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} 
                    stroke={metricColors[selectedMetric]}
                    strokeWidth={3}
                    activeDot={{ 
                      r: 8, 
                      onClick: (data) => handleTrendPointClick(data.payload) 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="trend" 
                    name="Trend Line" 
                    stroke={colors.brightAccent}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Bottom row - Dimensional Analysis & Seasonality */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top performers by dimension */}
            <div className="bg-surface rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">
                Top {selectedDimension.charAt(0).toUpperCase() + selectedDimension.slice(1)}s by {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              </h2>
              
              <div className="space-y-3 mb-4">
                {topPerformersByDimension[selectedDimension].map((item, index) => (
                  <div 
                    key={item.id}
                    onClick={() => handleDimensionItemClick(selectedDimension, item)}
                    className="flex items-center cursor-pointer hover:bg-surfaceLight p-3 rounded-lg transition-all"
                  >
                    <div 
                      className="w-1 h-10 rounded-full mr-3" 
                      style={{ 
                        backgroundColor: index === 0 ? colors.success : 
                                        index === 1 ? colors.primary :
                                        index === 2 ? colors.warning :
                                        index === 3 ? colors.info : colors.secondary
                      }}
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-bold">
                          {selectedMetric === 'revenue' || selectedMetric === 'margin' 
                            ? `$${(item.value / 1000).toFixed(1)}K` 
                            : item.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-surfaceLight mt-1 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${item.share}%`,
                            backgroundColor: index === 0 ? colors.success : 
                                          index === 1 ? colors.primary :
                                          index === 2 ? colors.warning :
                                          index === 3 ? colors.info : colors.secondary
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-3 text-textSecondary">
                      {item.share.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topPerformersByDimension[selectedDimension]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {topPerformersByDimension[selectedDimension].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? colors.success : 
                                  index === 1 ? colors.primary :
                                  index === 2 ? colors.warning :
                                  index === 3 ? colors.info : colors.secondary} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.surface, 
                          borderColor: colors.surfaceLight,
                          color: colors.text 
                        }}
                        formatter={(value) => [`${value.toLocaleString()}`, selectedMetric]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Seasonality analysis */}
            <div className="bg-surface rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">
                Seasonality & Residual Analysis
              </h2>
              
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.surfaceLight} />
                    <XAxis 
                      dataKey="period" 
                      stroke={colors.textSecondary}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { month: 'short' });
                      }}
                    />
                    <YAxis stroke={colors.textSecondary} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: colors.surface, 
                        borderColor: colors.surfaceLight,
                        color: colors.text 
                      }}
                      formatter={(value) => [`${value.toLocaleString()}`, 'Seasonal Component']}
                    />
                    <Bar 
                      dataKey="seasonal" 
                      name="Seasonal Component"
                      fill={colors.warning}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.surfaceLight} />
                    <XAxis 
                      type="category"
                      dataKey="period" 
                      name="Period" 
                      stroke={colors.textSecondary}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { month: 'short' });
                      }}
                    />
                    <YAxis 
                      dataKey="residual" 
                      name="Residual"
                      stroke={colors.textSecondary} 
                    />
                    <ZAxis range={[50, 300]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: colors.surface, 
                        borderColor: colors.surfaceLight,
                        color: colors.text 
                      }}
                      formatter={(value) => [`${value.toLocaleString()}`, 'Residual']}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter 
                      name="Residuals" 
                      data={trendData} 
                      fill={colors.secondary}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
        
        {/* Detail panel - shown when a specific item is selected */}
        {selectedDetail && (
          <div className="w-80 bg-surface border-l border-surfaceLight overflow-y-auto">
            <div className="p-4 border-b border-surfaceLight flex justify-between items-center">
              <h3 className="font-bold">
                {selectedDetail.type === 'period' 
                  ? new Date(selectedDetail.period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : `${selectedDetail.item.name} Details`
                }
              </h3>
              <button onClick={closeDetailPanel} className="p-1 hover:bg-surfaceLight rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4">
              {selectedDetail.type === 'period' ? (
                <div>
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      {['revenue', 'units', 'aov', 'margin'].map(metric => (
                        <div key={metric} className="bg-surfaceLight p-3 rounded-lg">
                          <div className="text-xs text-textSecondary capitalize">{metric}</div>
                          <div className="text-lg font-bold mt-1">
                            {metric === 'revenue' || metric === 'margin' 
                              ? `$${(selectedDetail.data[metric] / 1000).toFixed(1)}K` 
                              : metric === 'aov' 
                                ? `$${selectedDetail.data[metric].toFixed(2)}`
                                : selectedDetail.data[metric].toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm text-textSecondary mb-2">Time Series Components</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Trend</span>
                        <span className="font-medium">{selectedDetail.data.trend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Seasonal</span>
                        <span className="font-medium">{selectedDetail.data.seasonal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Residual</span>
                        <span className="font-medium">{selectedDetail.data.residual.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-textSecondary">Total {selectedMetric}</div>
                      <div className="font-bold">
                        {selectedMetric === 'revenue' || selectedMetric === 'margin' 
                          ? `$${(selectedDetail.item.value / 1000).toFixed(1)}K` 
                          : selectedMetric === 'aov' 
                            ? `$${selectedDetail.item.value.toFixed(2)}`
                            : selectedDetail.item.value.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-textSecondary">Share of total</div>
                      <div className="font-bold">{selectedDetail.item.share.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="h-32 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={trendData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="period" 
                          tick={false}
                          axisLine={false}
                        />
                        <YAxis hide={true} />
                        <Line 
                          type="monotone" 
                          dataKey={selectedMetric} 
                          stroke={metricColors[selectedMetric]}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="p-3 bg-surfaceLight rounded-lg">
                    <div className="text-sm text-textSecondary mb-1">Growth (YoY)</div>
                    <div className="flex items-center">
                      <ArrowUpRight size={18} className="text-success mr-1" />
                      <span className="text-lg font-bold text-success">+15.3%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Filter panel */}
        {isFilterPanelOpen && (
          <div className="w-80 bg-surface border-l border-surfaceLight overflow-y-auto">
            <div className="p-4 border-b border-surfaceLight flex justify-between items-center">
              <h3 className="font-bold">
                Filters
              </h3>
              <button onClick={toggleFilterPanel} className="p-1 hover:bg-surfaceLight rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Date range filter */}
              <div className="mb-6">
                <label className="block text-textSecondary text-sm font-medium mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="block w-full rounded-md bg-surfaceLight border-none text-text p-2"
                        placeholder="Start Date"
                        readOnly
                      />
                      <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-textSecondary pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="block w-full rounded-md bg-surfaceLight border-none text-text p-2"
                        placeholder="End Date"
                        readOnly
                      />
                      <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-textSecondary pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category filter */}
              <div className="mb-6">
                <label className="block text-textSecondary text-sm font-medium mb-2">
                  Categories
                </label>
                <div className="space-y-2">
                  {['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'].map(category => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Channels filter */}
              <div className="mb-6">
                <label className="block text-textSecondary text-sm font-medium mb-2">
                  Channels
                </label>
                <div className="space-y-2">
                  {['Online', 'Retail Stores', 'Wholesale', 'Marketplace'].map(channel => (
                    <label key={channel} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Regions filter */}
              <div className="mb-6">
                <label className="block text-textSecondary text-sm font-medium mb-2">
                  Regions
                </label>
                <div className="space-y-2">
                  {['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'].map(region => (
                    <label key={region} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button className="flex-1 py-2 rounded-lg bg-primary hover:bg-opacity-90">
                  Apply Filters
                </button>
                <button className="px-4 py-2 rounded-lg bg-surfaceLight hover:bg-opacity-90">
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTrendDashboard;