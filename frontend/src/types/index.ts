export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
export type Metric = 'revenue' | 'units' | 'aov' | 'margin'
export type Dimension = 'product' | 'category' | 'channel' | 'region' | 'customer' | null

export type ThemeMode = 'light' | 'dark'

export interface TrendDataPoint {
  period: string
  revenue: number
  units: number
  aov: number
  margin: number
  trend: number
  seasonal: number
  residual: number
  date: Date // For easier date manipulation
}

export interface TopPerformer {
  id: string
  name: string
  value: number
  share: number
  growth?: number
}

export interface OverallMetrics {
  totalRevenue: number
  totalUnits: number
  avgAov: number
  avgMargin: number
  revenueGrowth: number
  unitGrowth: number
  aovGrowth: number
  marginGrowth: number
}

export interface DimensionalBreakdown {
  [dimension: string]: TopPerformer[]
}

export interface FilterState {
  startDate: Date | null
  endDate: Date | null
  selectedCategories: string[]
  selectedChannels: string[]
  selectedRegions: string[]
  selectedProducts: string[]
}

export interface DashboardState {
  selectedTimePeriod: TimePeriod
  selectedMetric: Metric
  selectedDimension: Dimension
  isFilterPanelOpen: boolean
  selectedDetail: DetailSelection | null
  filters: FilterState
}

export interface DetailSelection {
  type: 'period' | 'dimension'
  period?: string
  data?: TrendDataPoint
  dimension?: Dimension
  item?: TopPerformer
}

export interface AnalysisComponentData {
  trend: Array<{period: string, value: number}>
  seasonal: Array<{period: string, value: number}>
  residual: Array<{period: string, value: number}>
} 