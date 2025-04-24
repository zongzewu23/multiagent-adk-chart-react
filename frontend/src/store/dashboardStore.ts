import { create } from 'zustand'
import {
  DashboardState,
  TimePeriod,
  Metric,
  Dimension,
  DetailSelection,
  FilterState,
  TrendDataPoint,
  TopPerformer
} from '../types'
import { generateMockData } from '../data/mockData'

// Initialize state with mock data for the selected time period
const initialTimePeriod: TimePeriod = 'monthly'
const { trendData, dimensionalBreakdown, overallMetrics } = generateMockData(initialTimePeriod)

interface DashboardStore extends DashboardState {
  trendData: TrendDataPoint[]
  dimensionalBreakdown: { [dimension: string]: TopPerformer[] }
  overallMetrics: {
    totalRevenue: number
    totalUnits: number
    avgAov: number
    avgMargin: number
    revenueGrowth: number
    unitGrowth: number
    aovGrowth: number
    marginGrowth: number
  }
  // Actions
  setSelectedTimePeriod: (timePeriod: TimePeriod) => void
  setSelectedMetric: (metric: Metric) => void
  setSelectedDimension: (dimension: Dimension) => void
  toggleFilterPanel: () => void
  setSelectedDetail: (detail: DetailSelection | null) => void
  updateFilters: (updates: Partial<FilterState>) => void
  refreshData: () => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  selectedTimePeriod: initialTimePeriod,
  selectedMetric: 'revenue',
  selectedDimension: 'product',
  isFilterPanelOpen: false,
  selectedDetail: null,
  filters: {
    startDate: null,
    endDate: null,
    selectedCategories: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'],
    selectedChannels: ['Online', 'Retail Stores', 'Wholesale', 'Marketplace'],
    selectedRegions: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'],
    selectedProducts: []
  },
  
  // Data
  trendData,
  dimensionalBreakdown,
  overallMetrics,
  
  // Actions
  setSelectedTimePeriod: (timePeriod) => {
    set({ selectedTimePeriod: timePeriod })
    get().refreshData()
  },
  
  setSelectedMetric: (metric) => {
    set({ selectedMetric: metric })
  },
  
  setSelectedDimension: (dimension) => {
    set({ selectedDimension: dimension })
  },
  
  toggleFilterPanel: () => {
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen }))
  },
  
  setSelectedDetail: (detail) => {
    set({ selectedDetail: detail })
  },
  
  updateFilters: (updates) => {
    set((state) => ({
      filters: { ...state.filters, ...updates }
    }))
    
    // Re-fetch data when filters change
    setTimeout(() => get().refreshData(), 0)
  },
  
  refreshData: () => {
    const { selectedTimePeriod } = get()
    const { trendData, dimensionalBreakdown, overallMetrics } = generateMockData(selectedTimePeriod)
    
    set({
      trendData,
      dimensionalBreakdown,
      overallMetrics
    })
  }
})) 