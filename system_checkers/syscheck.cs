using System;
using System.Collections.Generic;
using System.Management;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace LLMHardwareChecker
{
    class Program
    {
        [DllImport("kernel32.dll")]
        static extern IntPtr GetConsoleWindow();

        [DllImport("user32.dll")]
        static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        const int SW_HIDE = 0;

        static async Task Main(string[] args)
        {
            // Hide console window
            var handle = GetConsoleWindow();
            ShowWindow(handle, SW_HIDE);

            try
            {
                // Generate a unique session ID
                string sessionId = Guid.NewGuid().ToString();

                // Gather system information
                var systemInfo = new Dictionary<string, string>
                {
                    ["sessionId"] = sessionId,
                    ["OS"] = GetOSInfo(),
                    ["CPU"] = GetCPUInfo(),
                    ["RAM"] = GetTotalRAMInGB(),
                    ["GPU"] = GetGPUInfo(),
                    ["VRAM"] = GetGPUVRAM()
                };

                // Serialize and send data
                string jsonPayload = JsonSerializer.Serialize(systemInfo);
                string serverUrl = "https://canyourunai.com/api/system-check";
                bool success = await SendDataToServerAsync(jsonPayload, serverUrl);

                if (success)
                {
                    // Open browser with session ID
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = $"https://canyourunai.com?session={sessionId}",
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                // If there's an error, show it briefly
                MessageBox.Show($"Error: {ex.Message}", "CanYouRunAI System Checker", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static string GetOSInfo()
        {
            try
            {
                return Environment.OSVersion.ToString();
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        static string GetCPUInfo()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("select Name, NumberOfCores, MaxClockSpeed from Win32_Processor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        return $"{obj["Name"]} - {obj["NumberOfCores"]} cores @ {obj["MaxClockSpeed"]} MHz";
                    }
                }
                return "Unknown CPU";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        static string GetTotalRAMInGB()
        {
            try
            {
                double totalRamBytes = 0;
                using (var searcher = new ManagementObjectSearcher("Select TotalPhysicalMemory from Win32_ComputerSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        totalRamBytes = Convert.ToDouble(obj["TotalPhysicalMemory"]);
                    }
                }
                double totalRamGB = totalRamBytes / (1024 * 1024 * 1024);
                return totalRamGB.ToString("F1");
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        static string GetGPUInfo()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("select Name from Win32_VideoController"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        return obj["Name"]?.ToString() ?? "Unknown GPU";
                    }
                }
                return "Unknown GPU";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        static string GetGPUVRAM()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("select AdapterRAM from Win32_VideoController"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        if (obj["AdapterRAM"] != null)
                        {
                            double vramBytes = Convert.ToDouble(obj["AdapterRAM"]);
                            double vramGB = vramBytes / (1024 * 1024 * 1024);
                            return vramGB.ToString("F1");
                        }
                    }
                }
                return "Unknown VRAM";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        static async Task<bool> SendDataToServerAsync(string jsonPayload, string url)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("User-Agent", "CanYouRunAI-SystemChecker/1.0");
                    var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await client.PostAsync(url, content);
                    return response.IsSuccessStatusCode;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
