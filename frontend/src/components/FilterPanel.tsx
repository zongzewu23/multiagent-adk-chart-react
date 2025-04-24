import React from 'react'
import { X, Calendar } from 'lucide-react'
import { FilterState } from '../types'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onUpdateFilters: (updates: Partial<FilterState>) => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onApplyFilters,
  onResetFilters
}) => {
  if (!isOpen) return null
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.selectedCategories, category]
      : filters.selectedCategories.filter(c => c !== category)
      
    onUpdateFilters({ selectedCategories: updatedCategories })
  }
  
  const handleChannelChange = (channel: string, checked: boolean) => {
    const updatedChannels = checked
      ? [...filters.selectedChannels, channel]
      : filters.selectedChannels.filter(c => c !== channel)
      
    onUpdateFilters({ selectedChannels: updatedChannels })
  }
  
  const handleRegionChange = (region: string, checked: boolean) => {
    const updatedRegions = checked
      ? [...filters.selectedRegions, region]
      : filters.selectedRegions.filter(r => r !== region)
      
    onUpdateFilters({ selectedRegions: updatedRegions })
  }
  
  return (
    <div className="w-80 h-full bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border overflow-y-auto shadow-xl transition-all duration-300">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
        <h3 className="font-bold text-light-text dark:text-dark-text">
          Filters
        </h3>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-light-surfaceHover dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
          aria-label="Close filter panel"
        >
          <X size={18} className="text-light-textSecondary dark:text-dark-textSecondary" />
        </button>
      </div>
      
      <div className="p-4">
        {/* Date range filter */}
        <div className="mb-6">
          <label className="block text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="relative">
                <input 
                  type="text" 
                  className="block w-full rounded-md bg-light-surfaceHover dark:bg-dark-surfaceHover border-none text-light-text dark:text-dark-text p-2"
                  placeholder="Start Date"
                  readOnly
                  // In a real implementation, this would open a date picker
                />
                <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary pointer-events-none" />
              </div>
            </div>
            <div>
              <div className="relative">
                <input 
                  type="text" 
                  className="block w-full rounded-md bg-light-surfaceHover dark:bg-dark-surfaceHover border-none text-light-text dark:text-dark-text p-2"
                  placeholder="End Date"
                  readOnly
                  // In a real implementation, this would open a date picker
                />
                <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Category filter */}
        <div className="mb-6">
          <label className="block text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium mb-2">
            Categories
          </label>
          <div className="space-y-2">
            {['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'].map(category => (
              <label key={category} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2 accent-light-primary dark:accent-dark-primary" 
                  checked={filters.selectedCategories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                />
                <span className="text-light-text dark:text-dark-text">{category}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Channels filter */}
        <div className="mb-6">
          <label className="block text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium mb-2">
            Channels
          </label>
          <div className="space-y-2">
            {['Online', 'Retail Stores', 'Wholesale', 'Marketplace'].map(channel => (
              <label key={channel} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2 accent-light-primary dark:accent-dark-primary" 
                  checked={filters.selectedChannels.includes(channel)}
                  onChange={(e) => handleChannelChange(channel, e.target.checked)}
                />
                <span className="text-light-text dark:text-dark-text">{channel}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Regions filter */}
        <div className="mb-6">
          <label className="block text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium mb-2">
            Regions
          </label>
          <div className="space-y-2">
            {['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa'].map(region => (
              <label key={region} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="mr-2 accent-light-primary dark:accent-dark-primary"
                  checked={filters.selectedRegions.includes(region)}
                  onChange={(e) => handleRegionChange(region, e.target.checked)}
                />
                <span className="text-light-text dark:text-dark-text">{region}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2 mt-6">
          <button 
            onClick={onApplyFilters}
            className="flex-1 py-2 rounded-lg bg-light-primary hover:bg-opacity-90 text-white dark:bg-dark-primary dark:hover:bg-opacity-90 transition-colors"
          >
            Apply Filters
          </button>
          <button 
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-light-surfaceHover hover:bg-opacity-90 text-light-text dark:bg-dark-surfaceHover dark:hover:bg-opacity-90 dark:text-dark-text transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
} 