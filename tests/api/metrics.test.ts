import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/metrics/route'
import { getAllMetrics } from '@/lib/system-metrics'

// Mock the system metrics module
jest.mock('@/lib/system-metrics')
jest.mock('@/lib/db')

const mockGetAllMetrics = getAllMetrics as jest.MockedFunction<typeof getAllMetrics>

describe('/api/metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return system metrics successfully', async () => {
      const mockMetrics = {
        cpuUsage: 45.5,
        memoryUsage: 67.2,
        diskUsage: 23.1,
        timestamp: new Date('2024-01-01T12:00:00Z')
      }

      mockGetAllMetrics.mockResolvedValue(mockMetrics)

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockMetrics)
      expect(data.timestamp).toBeDefined()
      expect(mockGetAllMetrics).toHaveBeenCalledTimes(1)
    })

    it('should handle errors gracefully', async () => {
      mockGetAllMetrics.mockRejectedValue(new Error('System error'))

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch system metrics')
      expect(data.timestamp).toBeDefined()
    })

    it('should return valid JSON structure', async () => {
      const mockMetrics = {
        cpuUsage: 30.0,
        memoryUsage: 50.0,
        diskUsage: 40.0,
        timestamp: new Date()
      }

      mockGetAllMetrics.mockResolvedValue(mockMetrics)

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('timestamp')
      expect(typeof data.success).toBe('boolean')
      expect(typeof data.timestamp).toBe('string')
    })
  })

  describe('POST', () => {
    it('should return metrics history successfully', async () => {
      const mockHistory = [
        {
          id: 1,
          userId: 1,
          cpuUsage: 45,
          memoryUsage: 67,
          diskUsage: 23,
          timestamp: new Date('2024-01-01T12:00:00Z')
        }
      ]

      // Mock the database query
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockHistory)
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          limit: 10
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockHistory)
    })

    it('should handle missing userId in POST request', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          limit: 10
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User ID is required')
    })

    it('should handle database errors gracefully', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          limit: 10
        }
      })

      // Mock database error
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch metrics history')
    })
  })
})
