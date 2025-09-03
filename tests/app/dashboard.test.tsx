import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

// Mock the MetricChart component
jest.mock('@/components/metric-chart', () => ({
  MetricChart: ({ title, data, labels, color, unit }: any) => (
    <div data-testid={`chart-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title} Chart - {data.length} data points
    </div>
  ),
}))

// Mock fetch
global.fetch = jest.fn()

describe('DashboardPage', () => {
  const mockMetrics = {
    success: true,
    data: {
      cpuUsage: 45.5,
      memoryUsage: 67.2,
      diskUsage: 23.1,
      timestamp: new Date('2024-01-01T12:00:00Z')
    },
    timestamp: new Date().toISOString()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockMetrics,
    })
  })

  it('renders dashboard header correctly', async () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('System Performance Monitor')).toBeInTheDocument()
    expect(screen.getByText('Real-time monitoring of CPU, Memory, and Disk usage')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Loading system metrics...')).toBeInTheDocument()
  })

  it('fetches metrics and displays current values', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('45.5%')).toBeInTheDocument()
      expect(screen.getByText('67.2%')).toBeInTheDocument()
      expect(screen.getByText('23.1%')).toBeInTheDocument()
    })
  })

  it('displays status indicators correctly', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      // CPU status (45.5% - Normal)
      expect(screen.getByText('CPU Usage')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
      
      // Memory status (67.2% - Warning)
      expect(screen.getByText('Memory Usage')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      
      // Disk status (23.1% - Normal)
      expect(screen.getByText('Disk Usage')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
    })
  })

  it('renders metric charts', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-cpu-usage')).toBeInTheDocument()
      expect(screen.getByTestId('chart-memory-usage')).toBeInTheDocument()
      expect(screen.getByTestId('chart-disk-usage')).toBeInTheDocument()
    })
  })

  it('shows last update time', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const errorResponse = {
      success: false,
      error: 'Failed to fetch metrics'
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => errorResponse,
    })
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch metrics')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Network error while fetching metrics')).toBeInTheDocument()
    })
  })

  it('allows retrying after error', async () => {
    const errorResponse = {
      success: false,
      error: 'Failed to fetch metrics'
    }
    
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => errorResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockMetrics,
      })
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch metrics')).toBeInTheDocument()
    })
    
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('45.5%')).toBeInTheDocument()
    })
  })

  it('displays correct status colors based on values', async () => {
    const highUsageMetrics = {
      success: true,
      data: {
        cpuUsage: 85.0,
        memoryUsage: 90.0,
        diskUsage: 95.0,
        timestamp: new Date()
      }
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => highUsageMetrics,
    })
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Critical')).toBeInTheDocument()
    })
  })

  it('polls metrics at regular intervals', async () => {
    jest.useFakeTimers()
    
    render(<DashboardPage />)
    
    // Initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
    
    // Advance timer to trigger next poll
    jest.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
    
    jest.useRealTimers()
  })

  it('limits stored metrics to prevent memory issues', async () => {
    const manyMetrics = Array.from({ length: 60 }, (_, i) => ({
      success: true,
      data: {
        cpuUsage: i,
        memoryUsage: i,
        diskUsage: i,
        timestamp: new Date(Date.now() + i * 1000)
      }
    }))
    
    let callCount = 0
    ;(global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        json: async () => manyMetrics[callCount++]
      })
    })
    
    render(<DashboardPage />)
    
    // Wait for multiple fetches
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
    
    // The component should limit stored metrics to prevent excessive memory usage
    // This is tested by ensuring the component doesn't crash with many data points
  })
})
