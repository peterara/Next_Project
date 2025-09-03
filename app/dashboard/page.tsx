"use client";

import { useEffect, useState } from "react";
import { MetricChart } from "@/components/metric-chart";
import { SystemMetrics } from "@/lib/system-metrics";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/metrics");
      const result = await response.json();

      if (result.success) {
        const newMetrics = [...metrics, result.data];
        // Keep only last 50 data points
        if (newMetrics.length > 50) {
          newMetrics.splice(0, newMetrics.length - 50);
        }
        setMetrics(newMetrics);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(result.error || "Failed to fetch metrics");
      }
    } catch (err) {
      setError("Network error while fetching metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up polling interval (default: 2 seconds)
    const interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value < 60) return "text-success-500";
    if (value < 80) return "text-warning-500";
    return "text-danger-500";
  };

  const getStatusIcon = (value: number) => {
    if (value < 60) return <CheckCircle className="h-5 w-5 text-success-500" />;
    if (value < 80) return <AlertCircle className="h-5 w-5 text-warning-500" />;
    return <AlertCircle className="h-5 w-5 text-danger-500" />;
  };

  const currentMetrics = metrics[metrics.length - 1] || {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    timestamp: new Date(),
  };

  const timeLabels = metrics.map((m) =>
    new Date(m.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  const cpuData = metrics.map((m) => m.cpuUsage);
  const memoryData = metrics.map((m) => m.memoryUsage);
  const diskData = metrics.map((m) => m.diskUsage);

  // Get raw values for comparison
  const getRawValues = () => {
    if (metrics.length === 0) return null;

    const latest = metrics[metrics.length - 1];
    // Use actual system specifications if available
    if ("totalRAM" in latest && "totalDisk" in latest) {
      return {
        memory: {
          total: (latest as any).totalRAM,
          current: (latest as any).usedRAM,
          unit: "bytes",
        },
        disk: {
          total: (latest as any).totalDisk,
          current: (latest as any).usedDisk,
          unit: "bytes",
        },
      };
    }

    // Fallback to estimates if specs not available
    return {
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB estimate
        current: (latest.memoryUsage / 100) * (16 * 1024 * 1024 * 1024),
        unit: "GB",
      },
      disk: {
        total: 500 * 1024 * 1024 * 1024, // 500GB estimate
        current: (latest.diskUsage / 100) * (500 * 1024 * 1024 * 1024),
        unit: "GB",
      },
    };
  };

  if (isLoading && metrics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading system metrics...
          </p>
        </div>
      </div>
    );
  }

  if (error && metrics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={fetchMetrics} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          System Performance Monitor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time monitoring of CPU, Memory, and Disk usage
        </p>
        {lastUpdate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Status */}
        <div className="metric-card text-center">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
              CPU Usage
            </h3>
          </div>
          <div
            className={`text-4xl font-bold mb-2 ${getStatusColor(
              currentMetrics.cpuUsage
            )}`}
          >
            {currentMetrics.cpuUsage}%
          </div>
          <div className="flex items-center justify-center">
            {getStatusIcon(currentMetrics.cpuUsage)}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {currentMetrics.cpuUsage < 60
                ? "Normal"
                : currentMetrics.cpuUsage < 80
                ? "Warning"
                : "Critical"}
            </span>
          </div>
        </div>

        {/* Memory Status */}
        <div className="metric-card text-center">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-warning-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
              Memory Usage
            </h3>
          </div>
          <div
            className={`text-4xl font-bold mb-2 ${getStatusColor(
              currentMetrics.memoryUsage
            )}`}
          >
            {currentMetrics.memoryUsage}%
          </div>
          <div className="flex items-center justify-center">
            {getStatusIcon(currentMetrics.memoryUsage)}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {currentMetrics.memoryUsage < 60
                ? "Normal"
                : currentMetrics.memoryUsage < 80
                ? "Warning"
                : "Critical"}
            </span>
          </div>
        </div>

        {/* Disk Status */}
        <div className="metric-card text-center">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-danger-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
              Disk Usage
            </h3>
          </div>
          <div
            className={`text-4xl font-bold mb-2 ${getStatusColor(
              currentMetrics.diskUsage
            )}`}
          >
            {currentMetrics.diskUsage}%
          </div>
          <div className="flex items-center justify-center">
            {getStatusIcon(currentMetrics.diskUsage)}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {currentMetrics.diskUsage < 60
                ? "Normal"
                : currentMetrics.diskUsage < 80
                ? "Warning"
                : "Critical"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricChart
          title="CPU Usage"
          data={cpuData}
          labels={timeLabels}
          color="#3B82F6"
          unit="%"
        />
        <MetricChart
          title="Memory Usage"
          data={memoryData}
          labels={timeLabels}
          color="#F59E0B"
          unit="%"
        />
        <MetricChart
          title="Disk Usage"
          data={diskData}
          labels={timeLabels}
          color="#EF4444"
          unit="%"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
