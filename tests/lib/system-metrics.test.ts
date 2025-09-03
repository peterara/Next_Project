import {
  getCpuUsage,
  getMemoryInfo,
  getDiskInfo,
  getAllMetrics,
  formatBytes,
} from "@/lib/system-metrics";

// Mock child_process.exec
jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

// Mock os module
jest.mock("os", () => ({
  cpus: jest.fn(),
  totalmem: jest.fn(),
  freemem: jest.fn(),
  loadavg: jest.fn(),
}));

const mockExec = require("child_process").exec;
const mockOs = require("os");

describe("System Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCpuUsage", () => {
    it("should get CPU usage on Windows", async () => {
      const mockStdout = "LoadPercentage=45\r\n";
      mockExec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockStdout, stderr: "" });
      });

      const result = await getCpuUsage();

      expect(result).toBe(45);
      expect(mockExec).toHaveBeenCalledWith(
        "wmic cpu get loadpercentage /value",
        expect.any(Function)
      );
    });

    it("should get CPU usage on Unix systems", async () => {
      // Mock process.platform to be Unix-like
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
      });

      mockOs.cpus.mockReturnValue([
        { model: "Intel", speed: 2400 },
        { model: "Intel", speed: 2400 },
      ]);
      mockOs.loadavg.mockReturnValue([1.2, 1.1, 0.9]);

      const result = await getCpuUsage();

      expect(result).toBe(60); // (1.2 / 2) * 100
      expect(mockOs.cpus).toHaveBeenCalled();
      expect(mockOs.loadavg).toHaveBeenCalled();
    });

    it("should handle Windows command errors gracefully", async () => {
      mockExec.mockImplementation((command, callback) => {
        callback(new Error("Command failed"), { stdout: "", stderr: "Error" });
      });

      const result = await getCpuUsage();

      expect(result).toBe(0);
    });

    it("should handle invalid Windows output gracefully", async () => {
      const mockStdout = "InvalidOutput";
      mockExec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockStdout, stderr: "" });
      });

      const result = await getCpuUsage();

      expect(result).toBe(0);
    });
  });

  describe("getMemoryInfo", () => {
    it("should calculate memory usage correctly", () => {
      mockOs.totalmem.mockReturnValue(16384 * 1024 * 1024); // 16GB
      mockOs.freemem.mockReturnValue(8192 * 1024 * 1024); // 8GB

      const result = getMemoryInfo();

      expect(result.total).toBe(16384 * 1024 * 1024);
      expect(result.free).toBe(8192 * 1024 * 1024);
      expect(result.used).toBe(8192 * 1024 * 1024);
      expect(result.usage).toBe(50);
    });

    it("should handle edge cases", () => {
      mockOs.totalmem.mockReturnValue(0);
      mockOs.freemem.mockReturnValue(0);

      const result = getMemoryInfo();

      expect(result.total).toBe(0);
      expect(result.free).toBe(0);
      expect(result.used).toBe(0);
      expect(result.usage).toBe(0);
    });
  });

  describe("getDiskInfo", () => {
    it("should get disk info on Windows", async () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
      });

      const mockStdout = "Size=500000000000\r\nFreeSpace=300000000000\r\n";
      mockExec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockStdout, stderr: "" });
      });

      const result = await getDiskInfo();

      expect(result.total).toBe(500000000000);
      expect(result.free).toBe(300000000000);
      expect(result.used).toBe(200000000000);
      expect(result.usage).toBe(40);
    });

    it("should get disk info on Unix systems", async () => {
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
      });

      const mockStdout =
        "Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1      1000000  400000   600000  40% /\n";
      mockExec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockStdout, stderr: "" });
      });

      const result = await getDiskInfo();

      expect(result.total).toBe(1000000 * 1024);
      expect(result.used).toBe(400000 * 1024);
      expect(result.free).toBe(600000 * 1024);
      expect(result.usage).toBe(40);
    });

    it("should handle command errors gracefully", async () => {
      mockExec.mockImplementation((command, callback) => {
        callback(new Error("Command failed"), { stdout: "", stderr: "Error" });
      });

      const result = await getDiskInfo();

      expect(result.total).toBe(0);
      expect(result.free).toBe(0);
      expect(result.used).toBe(0);
      expect(result.usage).toBe(0);
    });

    it("should handle invalid output gracefully", async () => {
      const mockStdout = "InvalidOutput";
      mockExec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockStdout, stderr: "" });
      });

      const result = await getDiskInfo();

      expect(result.total).toBe(0);
      expect(result.free).toBe(0);
      expect(result.used).toBe(0);
      expect(result.usage).toBe(0);
    });
  });

  describe("getAllMetrics", () => {
    it("should return all metrics successfully", async () => {
      // Mock Windows platform
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
      });

      // Mock CPU command
      mockExec.mockImplementation((command, callback) => {
        if (command.includes("cpu")) {
          callback(null, { stdout: "LoadPercentage=45\r\n", stderr: "" });
        } else if (command.includes("logicaldisk")) {
          callback(null, {
            stdout: "Size=1000000000000\r\nFreeSpace=700000000000\r\n",
            stderr: "",
          });
        }
      });

      // Mock memory
      mockOs.totalmem.mockReturnValue(16384 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(8192 * 1024 * 1024);

      const result = await getAllMetrics();

      expect(result).toHaveProperty("cpuUsage");
      expect(result).toHaveProperty("memoryUsage");
      expect(result).toHaveProperty("diskUsage");
      expect(result).toHaveProperty("timestamp");
      expect(result.cpuUsage).toBe(45);
      expect(result.memoryUsage).toBe(50);
      expect(result.diskUsage).toBe(30);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle errors gracefully", async () => {
      mockExec.mockImplementation((command, callback) => {
        callback(new Error("Command failed"), { stdout: "", stderr: "Error" });
      });

      const result = await getAllMetrics();

      expect(result).toHaveProperty("cpuUsage");
      expect(result).toHaveProperty("memoryUsage");
      expect(result).toHaveProperty("diskUsage");
      expect(result).toHaveProperty("timestamp");
      // Should return 0 for failed metrics
      expect(result.cpuUsage).toBe(0);
      expect(result.diskUsage).toBe(0);
    });
  });

  describe("formatBytes", () => {
    it("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
    });

    it("should handle decimal values", () => {
      expect(formatBytes(1500)).toBe("1.46 KB");
      expect(formatBytes(1500000)).toBe("1.43 MB");
    });

    it("should handle very large numbers", () => {
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1024)).toBe("1 PB");
    });
  });
});
