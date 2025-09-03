import React from 'react'
import { render, screen } from '@testing-library/react'
import { MetricChart } from '@/components/metric-chart'

// Mock Chart.js to avoid canvas issues in tests
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="chart-line" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mock Chart Component
    </div>
  ),
}))

describe('MetricChart', () => {
  const defaultProps = {
    title: 'CPU Usage',
    data: [45, 52, 48, 61, 55],
    labels: ['12:00', '12:01', '12:02', '12:03', '12:04'],
    color: '#3B82F6',
    unit: '%',
    maxDataPoints: 20
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct title and current value', () => {
    render(<MetricChart {...defaultProps} />)
    
    expect(screen.getByText('CPU Usage')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('displays current metric value correctly', () => {
    const propsWithDifferentData = {
      ...defaultProps,
      data: [30, 45, 60, 75, 90]
    }
    
    render(<MetricChart {...propsWithDifferentData} />)
    
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const propsWithEmptyData = {
      ...defaultProps,
      data: [],
      labels: []
    }
    
    render(<MetricChart {...propsWithEmptyData} />)
    
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('limits data points to maxDataPoints', () => {
    const propsWithManyDataPoints = {
      ...defaultProps,
      data: Array.from({ length: 30 }, (_, i) => i),
      labels: Array.from({ length: 30 }, (_, i) => `12:${i.toString().padStart(2, '0')}`),
      maxDataPoints: 10
    }
    
    render(<MetricChart {...propsWithManyDataPoints} />)
    
    const chartElement = screen.getByTestId('chart-line')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')
    
    expect(chartData.labels).toHaveLength(10)
    expect(chartData.datasets[0].data).toHaveLength(10)
  })

  it('applies correct styling classes', () => {
    render(<MetricChart {...defaultProps} />)
    
    const chartContainer = screen.getByText('CPU Usage').closest('.metric-card')
    expect(chartContainer).toHaveClass('metric-card', 'h-80')
  })

  it('renders chart with correct data structure', () => {
    render(<MetricChart {...defaultProps} />)
    
    const chartElement = screen.getByTestId('chart-line')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')
    
    expect(chartData).toHaveProperty('labels')
    expect(chartData).toHaveProperty('datasets')
    expect(chartData.datasets).toHaveLength(1)
    expect(chartData.datasets[0]).toHaveProperty('label', 'CPU Usage')
    expect(chartData.datasets[0]).toHaveProperty('data', defaultProps.data)
    expect(chartData.datasets[0]).toHaveProperty('borderColor', defaultProps.color)
  })

  it('applies custom unit correctly', () => {
    const propsWithCustomUnit = {
      ...defaultProps,
      unit: 'MB'
    }
    
    render(<MetricChart {...propsWithCustomUnit} />)
    
    expect(screen.getByText('55MB')).toBeInTheDocument()
  })

  it('handles different color props', () => {
    const propsWithCustomColor = {
      ...defaultProps,
      color: '#EF4444'
    }
    
    render(<MetricChart {...propsWithCustomColor} />)
    
    const chartElement = screen.getByTestId('chart-line')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')
    
    expect(chartData.datasets[0].borderColor).toBe('#EF4444')
  })

  it('maintains responsive design classes', () => {
    render(<MetricChart {...defaultProps} />)
    
    const chartWrapper = screen.getByText('Mock Chart Component').closest('.h-64')
    expect(chartWrapper).toHaveClass('h-64')
  })

  it('displays correct time labels', () => {
    render(<MetricChart {...defaultProps} />)
    
    const chartElement = screen.getByTestId('chart-line')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')
    
    expect(chartData.labels).toEqual(defaultProps.labels)
  })

  it('handles single data point', () => {
    const propsWithSingleDataPoint = {
      ...defaultProps,
      data: [75],
      labels: ['12:00']
    }
    
    render(<MetricChart {...propsWithSingleDataPoint} />)
    
    expect(screen.getByText('75%')).toBeInTheDocument()
    
    const chartElement = screen.getByTestId('chart-line')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')
    
    expect(chartData.labels).toHaveLength(1)
    expect(chartData.datasets[0].data).toHaveLength(1)
  })
})
