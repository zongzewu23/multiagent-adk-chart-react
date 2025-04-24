import { 
  TrendDataPoint, 
  TopPerformer, 
  DimensionalBreakdown, 
  OverallMetrics,
  TimePeriod
} from '../types'

/**
 * Generates synthetic trend data that matches the structure expected from SalesTrendAnalyzer
 */
export function generateTrendData(
  timePeriod: TimePeriod = 'monthly', 
  periods: number = 24
): TrendDataPoint[] {
  const trendData: TrendDataPoint[] = []
  let baseValue = 10000
  
  // Generate a start date appropriate for the time period
  const now = new Date()
  let startDate: Date
  
  switch (timePeriod) {
    case 'daily':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - periods)
      break
    case 'weekly':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - periods * 7)
      break
    case 'quarterly':
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - periods * 3)
      break
    case 'annual':
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - periods)
      break
    case 'monthly':
    default:
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - periods)
  }
  
  for (let i = 0; i < periods; i++) {
    const currentDate = new Date(startDate)
    
    // Adjust the date based on time period
    switch (timePeriod) {
      case 'daily':
        currentDate.setDate(startDate.getDate() + i)
        break
      case 'weekly':
        currentDate.setDate(startDate.getDate() + i * 7)
        break
      case 'quarterly':
        currentDate.setMonth(startDate.getMonth() + i * 3)
        break
      case 'annual':
        currentDate.setFullYear(startDate.getFullYear() + i)
        break
      case 'monthly':
      default:
        currentDate.setMonth(startDate.getMonth() + i)
    }
    
    // Add seasonality, trend, and random variation
    const seasonality = 1 + 0.3 * Math.sin((i / (timePeriod === 'annual' ? 4 : 12)) * Math.PI * 2)
    const trend = 1 + 0.02 * i
    const randomFactor = 0.9 + Math.random() * 0.2
    
    const revenue = Math.round(baseValue * seasonality * trend * randomFactor)
    const units = Math.round(revenue / 50)
    const aov = Math.round(revenue / units)
    const margin = Math.round(revenue * 0.3 * (0.9 + Math.random() * 0.2))
    
    // Format the period string based on time period
    let periodString: string
    switch (timePeriod) {
      case 'daily':
        periodString = currentDate.toISOString().slice(0, 10)
        break
      case 'weekly':
        periodString = `${currentDate.getFullYear()}-W${Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7)}`
        break
      case 'quarterly':
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1
        periodString = `${currentDate.getFullYear()}-Q${quarter}`
        break
      case 'annual':
        periodString = currentDate.getFullYear().toString()
        break
      case 'monthly':
      default:
        periodString = currentDate.toISOString().slice(0, 7)
    }
    
    trendData.push({
      period: periodString,
      date: new Date(currentDate),
      revenue: revenue,
      units: units,
      aov: aov,
      margin: margin,
      trend: Math.round(baseValue * trend),
      seasonal: Math.round(baseValue * seasonality),
      residual: Math.round(baseValue * (randomFactor - 1))
    })
  }
  
  return trendData
}

/**
 * Generates dimensional breakdown data with top performers
 */
export function generateDimensionalBreakdown(): DimensionalBreakdown {
  const dimensions = ['product', 'category', 'channel', 'region', 'customer']
  const dimensionalBreakdown: DimensionalBreakdown = {}
  
  dimensions.forEach(dimension => {
    const performers: TopPerformer[] = []
    for (let i = 0; i < 5; i++) {
      const baseValue = 10000 * (5 - i) * (0.8 + Math.random() * 0.4)
      performers.push({
        id: `${dimension}_${i+1}`,
        name: `${dimension.charAt(0).toUpperCase() + dimension.slice(1)} ${i+1}`,
        value: Math.round(baseValue),
        share: Math.round((5 - i) * 5 + Math.random() * 5),
        growth: Math.round((-5 + Math.random() * 30) * 10) / 10
      })
    }
    dimensionalBreakdown[dimension] = performers
  })
  
  return dimensionalBreakdown
}

/**
 * Generates overall metrics
 */
export function generateOverallMetrics(trendData: TrendDataPoint[]): OverallMetrics {
  const totalRevenue = trendData.reduce((sum, item) => sum + item.revenue, 0)
  const totalUnits = trendData.reduce((sum, item) => sum + item.units, 0)
  const avgAov = trendData.reduce((sum, item) => sum + item.aov, 0) / trendData.length
  const avgMargin = trendData.reduce((sum, item) => sum + item.margin, 0) / trendData.length
  
  return {
    totalRevenue: totalRevenue,
    totalUnits: totalUnits,
    avgAov: avgAov,
    avgMargin: avgMargin,
    revenueGrowth: Math.round((-5 + Math.random() * 25) * 10) / 10,
    unitGrowth: Math.round((-10 + Math.random() * 20) * 10) / 10,
    aovGrowth: Math.round((-3 + Math.random() * 15) * 10) / 10,
    marginGrowth: Math.round((-8 + Math.random() * 30) * 10) / 10
  }
}

/**
 * Generates a complete mock dataset
 */
export function generateMockData(timePeriod: TimePeriod = 'monthly') {
  const trendData = generateTrendData(timePeriod)
  const dimensionalBreakdown = generateDimensionalBreakdown()
  const overallMetrics = generateOverallMetrics(trendData)
  
  return {
    trendData,
    dimensionalBreakdown,
    overallMetrics
  }
} 