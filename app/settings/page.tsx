"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

interface UserSettings {
  theme: string;
  pollingInterval: number;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    pollingInterval: 2000,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Mock user ID for demo purposes
  const userId = 1;

  useEffect(() => {
    // Load current settings
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        if (result.data.theme) {
          setTheme(result.data.theme);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          theme: settings.theme,
          pollingInterval: settings.pollingInterval,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        // Update theme if changed
        if (settings.theme !== theme) {
          setTheme(settings.theme);
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save settings",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error while saving settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  const handlePollingIntervalChange = (newInterval: number) => {
    setSettings((prev) => ({ ...prev, pollingInterval: newInterval }));
  };

  const pollingIntervalOptions = [
    { value: 1000, label: "1 second" },
    { value: 2000, label: "2 seconds" },
    { value: 5000, label: "5 seconds" },
    { value: 10000, label: "10 seconds" },
    { value: 30000, label: "30 seconds" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your dashboard preferences and monitoring settings
        </p>
      </div>

      {/* Settings Form */}
      <div className="metric-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSettings();
          }}
          className="space-y-6"
        >
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Light", icon: "☀️" },
                { value: "dark", label: "Dark", icon: "🌙" },
                { value: "system", label: "System", icon: "💻" },
              ].map((themeOption) => (
                <button
                  key={themeOption.value}
                  type="button"
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    settings.theme === themeOption.value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="text-2xl mb-2">{themeOption.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {themeOption.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Polling Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Metrics Update Frequency
            </label>
            <select
              value={settings.pollingInterval}
              onChange={(e) =>
                handlePollingIntervalChange(parseInt(e.target.value))
              }
              className="select-field"
            >
              {pollingIntervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              How often the dashboard should fetch new system metrics
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-lg p-4 border ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span
              className={
                message.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About These Settings
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Theme:</strong> Choose between light, dark, or system theme.
            System theme automatically follows your operating system preference.
          </p>
          <p>
            <strong>Update Frequency:</strong> Lower intervals provide more
            real-time data but may increase system load. Higher intervals are
            more efficient but less responsive.
          </p>
          <p>
            <strong>Note:</strong> These settings are saved per user and will
            persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
