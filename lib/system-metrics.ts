import os from 'os'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  timestamp: Date
}

export interface MemoryInfo {
  total: number
  free: number
  used: number
  usage: number
}

export interface DiskInfo {
  total: number
  free: number
  used: number
  usage: number
}

// Get CPU usage percentage - improved for Windows
export async function getCpuUsage(): Promise<number> {
  try {
    if (process.platform === 'win32') {
      // Use PowerShell to get more accurate CPU usage
      const { stdout } = await execAsync('powershell "Get-Counter \'\\Processor(_Total)\\% Processor Time\' | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue"')
      const cpuUsage = parseFloat(stdout.trim())
      return Math.round(cpuUsage)
    }
    
    // For Unix-like systems, calculate from /proc/loadavg
    const cpus = os.cpus().length
    const loadAvg = os.loadavg()[0] // 1 minute load average
    const cpuUsage = Math.min((loadAvg / cpus) * 100, 100)
    return Math.round(cpuUsage)
  } catch (error) {
    console.error('Error getting CPU usage:', error)
    // Fallback to wmic if PowerShell fails
    try {
      const { stdout } = await execAsync('wmic cpu get loadpercentage /value')
      const match = stdout.match(/LoadPercentage=(\d+)/)
      return match ? parseInt(match[1]) : 0
    } catch (fallbackError) {
      console.error('Fallback CPU usage method failed:', fallbackError)
      return 0
    }
  }
}

// Get memory usage information - improved for Windows
export async function getMemoryInfo(): Promise<MemoryInfo> {
  try {
    if (process.platform === 'win32') {
      // Use PowerShell to get more accurate memory info
      const { stdout } = await execAsync('powershell "Get-Counter \'\\Memory\\Available MBytes\' | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue"')
      const availableMB = parseFloat(stdout.trim())
      
      // Get total physical memory
      const { stdout: totalMemOutput } = await execAsync('wmic computersystem get TotalPhysicalMemory /value')
      const totalMemMatch = totalMemOutput.match(/TotalPhysicalMemory=(\d+)/)
      const totalBytes = totalMemMatch ? parseInt(totalMemMatch[1]) : 0
      const totalMB = totalBytes / (1024 * 1024)
      
      const usedMB = totalMB - availableMB
      const usage = totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0
      
      return {
        total: totalBytes,
        free: availableMB * 1024 * 1024,
        used: usedMB * 1024 * 1024,
        usage
      }
    }
    
    // Fallback to Node.js os module for other platforms
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    const usage = Math.round((used / total) * 100)
    
    return {
      total,
      free,
      used,
      usage
    }
  } catch (error) {
    console.error('Error getting memory info:', error)
    // Final fallback to Node.js os module
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    const usage = Math.round((used / total) * 100)
    
    return {
      total,
      free,
      used,
      usage
    }
  }
}

// Get disk usage information - improved for Windows
export async function getDiskInfo(): Promise<DiskInfo> {
  try {
    if (process.platform === 'win32') {
      // Use PowerShell to get more accurate disk info
      const { stdout } = await execAsync('powershell "Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | Select-Object Size,FreeSpace | ForEach-Object {$_.Size; $_.FreeSpace}"')
      const lines = stdout.trim().split('\n')
      let total = 0
      let free = 0
      
      for (let i = 0; i < lines.length; i += 2) {
        if (lines[i] && lines[i + 1]) {
          total += parseInt(lines[i]) || 0
          free += parseInt(lines[i + 1]) || 0
        }
      }
      
      const used = total - free
      const usage = total > 0 ? Math.round((used / total) * 100) : 0
      
      return { total, free, used, usage }
    } else {
      // For Unix-like systems, use df command
      const { stdout } = await execAsync('df -k / | tail -1')
      const parts = stdout.trim().split(/\s+/)
      const total = parseInt(parts[1]) * 1024 // Convert KB to bytes
      const used = parseInt(parts[2]) * 1024
      const free = parseInt(parts[3]) * 1024
      const usage = Math.round((used / total) * 100)
      
      return { total, free, used, usage }
    }
  } catch (error) {
    console.error('Error getting disk usage:', error)
    // Fallback to wmic if PowerShell fails
    try {
      const { stdout } = await execAsync('wmic logicaldisk get size,freespace /value')
      const lines = stdout.trim().split('\n')
      let total = 0
      let free = 0
      
      for (const line of lines) {
        if (line.includes('Size=')) {
          total += parseInt(line.split('=')[1]) || 0
        } else if (line.includes('FreeSpace=')) {
          free += parseInt(line.split('=')[1]) || 0
        }
      }
      
      const used = total - free
      const usage = total > 0 ? Math.round((used / total) * 100) : 0
      
      return { total, free, used, usage }
    } catch (fallbackError) {
      console.error('Fallback disk usage method failed:', fallbackError)
      return { total: 0, free: 0, used: 0, usage: 0 }
    }
  }
}

// Get all system metrics
export async function getAllMetrics(): Promise<SystemMetrics> {
  const [cpuUsage, diskInfo, memoryInfo] = await Promise.all([
    getCpuUsage(),
    getDiskInfo(),
    getMemoryInfo()
  ])
  
  return {
    cpuUsage,
    memoryUsage: memoryInfo.usage,
    diskUsage: diskInfo.usage,
    timestamp: new Date()
  }
}

// Get system specifications
export async function getSystemSpecs(): Promise<{
  totalRAM: number
  totalDisk: number
}> {
  try {
    if (process.platform === 'win32') {
      // Get total RAM
      const { stdout: ramOutput } = await execAsync('wmic computersystem get TotalPhysicalMemory /value')
      const ramMatch = ramOutput.match(/TotalPhysicalMemory=(\d+)/)
      const totalRAM = ramMatch ? parseInt(ramMatch[1]) : 0
      
      // Get total disk space
      const { stdout: diskOutput } = await execAsync('wmic logicaldisk get size /value')
      const diskLines = diskOutput.trim().split('\n')
      let totalDisk = 0
      
      for (const line of diskLines) {
        if (line.includes('Size=')) {
          totalDisk += parseInt(line.split('=')[1]) || 0
        }
      }
      
      return { totalRAM, totalDisk }
    }
    
    // For Unix-like systems
    const totalRAM = os.totalmem()
    const { stdout } = await execAsync('df -k / | tail -1')
    const parts = stdout.trim().split(/\s+/)
    const totalDisk = parseInt(parts[1]) * 1024 // Convert KB to bytes
    
    return { totalRAM, totalDisk }
  } catch (error) {
    console.error('Error getting system specs:', error)
    return { totalRAM: 0, totalDisk: 0 }
  }
}

// Get all system metrics with specs
export async function getAllMetricsWithSpecs(): Promise<SystemMetrics & {
  totalRAM: number
  totalDisk: number
  usedRAM: number
  usedDisk: number
}> {
  const [metrics, specs] = await Promise.all([
    getAllMetrics(),
    getSystemSpecs()
  ])
  
  const usedRAM = (metrics.memoryUsage / 100) * specs.totalRAM
  const usedDisk = (metrics.diskUsage / 100) * specs.totalDisk
  
  return {
    ...metrics,
    totalRAM: specs.totalRAM,
    totalDisk: specs.totalDisk,
    usedRAM,
    usedDisk
  }
}

// Format bytes to human readable format
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
