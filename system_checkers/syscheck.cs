using System;
using System.Diagnostics;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.Win32;
using System.Windows.Forms;

class Program
{
    [DllImport("kernel32.dll")]
    static extern IntPtr GetConsoleWindow();

    [DllImport("user32.dll")]
    static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    const int SW_HIDE = 0;
    
    // Configuration for different environments
    static class Config
    {
        public static readonly string[] ApiUrls = {
            "https://canyourunai.com/api/system-check",  // Production
            "http://localhost:3000/api/system-check",    // Development
        };

        public static readonly string[] WebUrls = {
            "https://canyourunai.com",                  // Production
            "http://localhost:3000"                     // Development
        };
    }

    static async Task Main(string[] args)
    {
        var handle = GetConsoleWindow();
        ShowWindow(handle, SW_HIDE);

        try
        {
            var sessionId = Guid.NewGuid().ToString();
            var systemInfo = new Dictionary<string, string>
            {
                ["sessionId"] = sessionId,
                ["OS"] = Environment.OSVersion.ToString(),
                ["CPU"] = GetCPUInfo(),
                ["RAM"] = GetTotalRAM(),
                ["GPU"] = GetGPUInfo(),
                ["VRAM"] = GetGPUVRAM()  // Added back VRAM check
            };

            var jsonPayload = JsonSerializer.Serialize(systemInfo);
            
            // Try each environment until one succeeds
            bool success = false;
            string successUrl = "";
            
            for (int i = 0; i < Config.ApiUrls.Length; i++)
            {
                if (await SendDataAsync(jsonPayload, Config.ApiUrls[i]))
                {
                    success = true;
                    successUrl = Config.WebUrls[i];
                    break;
                }
            }

            if (success)
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = $"{successUrl}?session={sessionId}",
                    UseShellExecute = true
                });
            }
            else
            {
                throw new Exception("Could not connect to any environment (production or development)");
            }
        }
        catch (Exception ex)
        {
            // Show error message in a message box since console is hidden
            System.Windows.Forms.MessageBox.Show(
                $"Error checking system: {ex.Message}",
                "CanYouRunAI System Checker",
                System.Windows.Forms.MessageBoxButtons.OK,
                System.Windows.Forms.MessageBoxIcon.Error
            );
        }
    }

    static string GetCPUInfo()
    {
        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"HARDWARE\DESCRIPTION\System\CentralProcessor\0");
            var name = key?.GetValue("ProcessorNameString")?.ToString();
            if (string.IsNullOrEmpty(name)) throw new Exception("Could not read CPU info");
            return name;
        }
        catch
        {
            // Fallback to basic info if registry read fails
            return $"{Environment.ProcessorCount} cores @ unknown speed";
        }
    }

    static string GetTotalRAM()
    {
        try
        {
            return (GC.GetGCMemoryInfo().TotalAvailableMemoryBytes / (1024.0 * 1024 * 1024)).ToString("F1");
        }
        catch
        {
            return "Unknown";
        }
    }

    static string GetGPUInfo()
    {
        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"HARDWARE\DEVICEMAP\VIDEO");
            if (key == null) return "Unknown GPU";
            
            var subKeyName = key.GetValueNames().FirstOrDefault();
            if (subKeyName == null) return "Unknown GPU";
            
            using var gpuKey = Registry.LocalMachine.OpenSubKey(key.GetValue(subKeyName)?.ToString() ?? "");
            return gpuKey?.GetValue("Device Description")?.ToString() ?? "Unknown GPU";
        }
        catch
        {
            return "Unknown GPU";
        }
    }

    static string GetGPUVRAM()
    {
        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"HARDWARE\DEVICEMAP\VIDEO");
            if (key == null) return "Unknown";

            var subKeyName = key.GetValueNames().FirstOrDefault();
            if (subKeyName == null) return "Unknown";

            using var gpuKey = Registry.LocalMachine.OpenSubKey(key.GetValue(subKeyName)?.ToString() ?? "");
            var memorySize = gpuKey?.GetValue("HardwareInformation.MemorySize");
            
            if (memorySize != null)
            {
                double vramBytes = Convert.ToDouble(memorySize);
                return (vramBytes / (1024 * 1024 * 1024)).ToString("F1");
            }
            return "Unknown";
        }
        catch
        {
            return "Unknown";
        }
    }

    static async Task<bool> SendDataAsync(string jsonPayload, string url)
    {
        try
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", "CanYouRunAI-SystemChecker/1.0");
            var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync(url, content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}