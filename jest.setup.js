import '@testing-library/jest-dom'

// Mock Chart.js to avoid canvas issues in tests
jest.mock('chart.js/auto', () => ({
  Chart: jest.fn(),
  registerables: [],
}))

// Mock os-utils for consistent testing
jest.mock('os-utils', () => ({
  cpuUsage: jest.fn(() => Promise.resolve(45.5)),
  memUsage: jest.fn(() => Promise.resolve(67.2)),
  totalMem: jest.fn(() => Promise.resolve(16384)),
  freeMem: jest.fn(() => Promise.resolve(5376)),
  loadAverage: jest.fn(() => Promise.resolve([1.2, 1.1, 0.9])),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))
