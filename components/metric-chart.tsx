"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricChartProps {
  title: string;
  data: number[];
  labels: string[];
  color: string;
  unit?: string;
  maxDataPoints?: number;
}

export function MetricChart({
  title,
  data,
  labels,
  color,
  unit = "%",
  maxDataPoints = 20,
}: MetricChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderWidth: number;
      fill: boolean;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
    }>;
  }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Limit data points to prevent chart from becoming too wide
    const limitedData = data.slice(-maxDataPoints);
    const limitedLabels = labels.slice(-maxDataPoints);

    setChartData({
      labels: limitedLabels,
      datasets: [
        {
          label: title,
          data: limitedData,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    });
  }, [data, labels, title, color, maxDataPoints]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        grid: {
          color: "#E5E7EB",
        },
        ticks: {
          color: "#6B7280",
          callback: function (value) {
            return `${value}${unit}`;
          },
        },
        min: 0,
        max: 100,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      point: {
        hoverBackgroundColor: color,
        hoverBorderColor: "white",
        hoverBorderWidth: 2,
      },
    },
  };

  return (
    <div className="metric-card h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.length > 0 ? `${data[data.length - 1]}${unit}` : `0${unit}`}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Current
          </div>
        </div>
      </div>
      <div className="h-64">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
