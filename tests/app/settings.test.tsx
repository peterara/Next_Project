import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SettingsPage from '@/app/settings/page'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('SettingsPage', () => {
  const mockSettings = {
    success: true,
    data: {
      theme: 'dark',
      pollingInterval: 5000
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockSettings,
    })
  })

  it('renders settings header correctly', () => {
    render(<SettingsPage />)
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Configure your dashboard preferences and monitoring settings')).toBeInTheDocument()
  })

  it('loads current settings on mount', async () => {
    render(<SettingsPage />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings?userId=1')
    })
  })

  it('displays theme selection options', () => {
    render(<SettingsPage />)
    
    expect(screen.getByText('☀️')).toBeInTheDocument()
    expect(screen.getByText('🌙')).toBeInTheDocument()
    expect(screen.getByText('💻')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('allows theme selection', () => {
    render(<SettingsPage />)
    
    const darkThemeButton = screen.getByText('🌙').closest('button')
    expect(darkThemeButton).toBeInTheDocument()
    
    if (darkThemeButton) {
      fireEvent.click(darkThemeButton)
    }
  })

  it('displays polling interval options', () => {
    render(<SettingsPage />)
    
    expect(screen.getByText('Metrics Update Frequency')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
    
    const select = screen.getByDisplayValue('2000')
    expect(select).toHaveValue('2000')
  })

  it('allows polling interval selection', () => {
    render(<SettingsPage />)
    
    const select = screen.getByDisplayValue('2000')
    fireEvent.change(select, { target: { value: '5000' } })
    
    expect(select).toHaveValue('5000')
  })

  it('saves settings successfully', async () => {
    const saveResponse = {
      success: true,
      data: {
        theme: 'dark',
        pollingInterval: 5000
      }
    }
    
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockSettings,
      })
      .mockResolvedValueOnce({
        json: async () => saveResponse,
      })
    
    render(<SettingsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings?userId=1')
    })
    
    // Change theme
    const darkThemeButton = screen.getByText('🌙').closest('button')
    if (darkThemeButton) {
      fireEvent.click(darkThemeButton)
    }
    
    // Change polling interval
    const select = screen.getByDisplayValue('2000')
    fireEvent.change(select, { target: { value: '5000' } })
    
    // Save settings
    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          theme: 'dark',
          pollingInterval: 5000,
        }),
      })
    })
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument()
    })
  })

  it('handles save errors gracefully', async () => {
    const errorResponse = {
      success: false,
      error: 'Failed to save settings'
    }
    
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockSettings,
      })
      .mockResolvedValueOnce({
        json: async () => errorResponse,
      })
    
    render(<SettingsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings?userId=1')
    })
    
    // Save settings
    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save settings')).toBeInTheDocument()
    })
  })

  it('handles network errors during save', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockSettings,
      })
      .mockRejectedValueOnce(new Error('Network error'))
    
    render(<SettingsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings?userId=1')
    })
    
    // Save settings
    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Network error while saving settings')).toBeInTheDocument()
    })
  })

  it('shows loading state during save', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockSettings,
      })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SettingsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings?userId=1')
    })
    
    // Save settings
    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)
    
    // Check loading state
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Save Settings')).toBeInTheDocument()
  })

  it('displays information about settings', () => {
    render(<SettingsPage />)
    
    expect(screen.getByText('About These Settings')).toBeInTheDocument()
    expect(screen.getByText(/Theme:/)).toBeInTheDocument()
    expect(screen.getByText(/Update Frequency:/)).toBeInTheDocument()
    expect(screen.getByText(/These settings are saved per user/)).toBeInTheDocument()
  })

  it('validates form submission', async () => {
    render(<SettingsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings?userId=1')
    })
    
    // Try to submit without changes
    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)
    
    // Should still attempt to save with current values
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          theme: 'light',
          pollingInterval: 2000,
        }),
      })
    })
  })

  it('maintains form state during interactions', () => {
    render(<SettingsPage />)
    
    // Change polling interval
    const select = screen.getByDisplayValue('2000')
    fireEvent.change(select, { target: { value: '10000' } })
    
    // Verify the change is maintained
    expect(select).toHaveValue('10000')
    
    // Change theme
    const systemThemeButton = screen.getByText('💻').closest('button')
    if (systemThemeButton) {
      fireEvent.click(systemThemeButton)
    }
    
    // Verify both changes are maintained
    expect(select).toHaveValue('10000')
  })
})
