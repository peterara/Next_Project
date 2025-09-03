import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/settings/route'

// Mock the database module
jest.mock('@/lib/db')

describe('/api/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return user settings successfully', async () => {
      const mockSettings = {
        id: 1,
        userId: 1,
        theme: 'dark',
        pollingInterval: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock the database query
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockSettings])
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/settings?userId=1'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSettings)
    })

    it('should return default settings when no settings exist', async () => {
      // Mock empty database result
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/settings?userId=1'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual({
        theme: 'light',
        pollingInterval: 2000
      })
    })

    it('should require userId parameter', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/settings'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User ID is required')
    })

    it('should handle database errors gracefully', async () => {
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/settings?userId=1'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch user settings')
    })
  })

  describe('POST', () => {
    it('should create new settings successfully', async () => {
      const newSettings = {
        id: 1,
        userId: 1,
        theme: 'dark',
        pollingInterval: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock empty database result (no existing settings)
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([newSettings])
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          theme: 'dark',
          pollingInterval: 5000
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(newSettings)
    })

    it('should update existing settings successfully', async () => {
      const existingSettings = {
        id: 1,
        userId: 1,
        theme: 'light',
        pollingInterval: 2000,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const updatedSettings = {
        ...existingSettings,
        theme: 'dark',
        pollingInterval: 5000
      }

      // Mock existing settings in database
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingSettings]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedSettings])
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          theme: 'dark',
          pollingInterval: 5000
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(updatedSettings)
    })

    it('should validate theme values', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          theme: 'invalid-theme',
          pollingInterval: 2000
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid theme value')
    })

    it('should validate polling interval range', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          theme: 'light',
          pollingInterval: 500 // Too low
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Polling interval must be between 1000 and 30000 ms')
    })

    it('should require userId in request body', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          theme: 'light',
          pollingInterval: 2000
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User ID is required')
    })

    it('should handle database errors gracefully', async () => {
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      }

      jest.doMock('@/lib/db', () => ({
        db: mockDb
      }))

      const { req } = createMocks({
        method: 'POST',
        body: {
          userId: 1,
          theme: 'light',
          pollingInterval: 2000
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to update user settings')
    })
  })
})
