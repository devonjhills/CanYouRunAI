// To build standalone executable:
// go build -o CanYouRunAI.exe system_checker.go
// OR GOOS=windows GOARCH=amd64 go build -o CanYouRunAI.exe system_checker.go
// To build for Linux:
// GOOS=linux GOARCH=amd64 go build -o CanYouRunAI system_checker.go

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"io"
	"runtime"
	"strconv"
	"math"

	"github.com/google/uuid"
)

// SystemInfo holds the system details.
type SystemInfo struct {
	SessionID string `json:"sessionId"`
	Storage   string `json:"Storage"`
	CPU       string `json:"CPU"`
	RAM       string `json:"RAM"`
	GPU       string `json:"GPU"`
	VRAM      string `json:"VRAM"`
	GPUBandwidth float64 `json:"GPUBandwidth"`
}

// execWMIC runs a WMIC command with the given arguments and returns the output.
func execWMIC(args ...string) (string, error) {
	cmd := exec.Command("wmic", args...)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func getStorageSpaceLinux() string {
	cmd := exec.Command("df", "-B1", "--output=avail", "/")
	out, err := cmd.Output()
	if err != nil {
		log.Printf("Error retrieving storage info: %v", err)
		return "Unknown"
	}
	
	// Skip header line and convert bytes to GB
	lines := strings.Split(string(out), "\n")
	if len(lines) < 2 {
		return "Unknown"
	}
	
	var bytesValue float64
	fmt.Sscanf(strings.TrimSpace(lines[1]), "%f", &bytesValue)
	return fmt.Sprintf("%.1f GB", bytesValue/(1024*1024*1024))
}

// Modify getStorageSpace to be OS-aware
func getStorageSpace() string {
	if runtime.GOOS == "windows" {
		return getStorageSpaceWindows()
	}
	return getStorageSpaceLinux()
}

// Rename existing Windows function
func getStorageSpaceWindows() string {
	out, err := execWMIC("logicaldisk", "where", "DriveType=3", "get", "FreeSpace", "/format:list")
	if err != nil {
		log.Printf("Error retrieving storage info: %v", err)
		return "Unknown"
	}
	
	var totalFreeGB float64
	for _, line := range strings.Split(out, "\n") {
		if strings.HasPrefix(line, "FreeSpace=") {
			val := strings.TrimSpace(strings.TrimPrefix(line, "FreeSpace="))
			var bytesValue float64
			fmt.Sscanf(val, "%f", &bytesValue)
			totalFreeGB += bytesValue / (1024 * 1024 * 1024)
		}
	}
	
	if totalFreeGB > 0 {
		return fmt.Sprintf("%.1f GB", totalFreeGB)
	}
	return "Unknown"
}

// getCPUInfo retrieves the CPU name.
func getCPUInfo() string {
	if runtime.GOOS == "windows" {
		return getCPUInfoWindows()
	}
	return getCPUInfoLinux()
}

// getRAMInfo retrieves the total physical memory (in GB).
func getRAMInfo() string {
	if runtime.GOOS == "windows" {
		return getRAMInfoWindows()
	}
	return getRAMInfoLinux()
}

func getCPUInfoLinux() string {
	cmd := exec.Command("cat", "/proc/cpuinfo")
	out, err := cmd.Output()
	if err != nil {
		log.Printf("Error retrieving CPU info: %v", err)
		return "Unknown"
	}
	
	lines := strings.Split(string(out), "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "model name") {
			return strings.TrimSpace(strings.TrimPrefix(line, "model name\t:"))
		}
	}
	return "Unknown"
}

func getRAMInfoLinux() string {
	cmd := exec.Command("free", "-b")
	out, err := cmd.Output()
	if err != nil {
		log.Printf("Error retrieving RAM info: %v", err)
		return "Unknown"
	}
	
	lines := strings.Split(string(out), "\n")
	if len(lines) < 2 {
		return "Unknown"
	}
	
	fields := strings.Fields(lines[1])
	if len(fields) < 2 {
		return "Unknown"
	}
	
	totalBytes, err := strconv.ParseFloat(fields[1], 64)
	if err != nil {
		return "Unknown"
	}
	
	gb := math.Ceil(totalBytes / (1024 * 1024 * 1024))
	return fmt.Sprintf("%.0f GB", gb)
}

func getGPUBandwidthNvidia() float64 {
	cmd := exec.Command("nvidia-smi", "--query-gpu=memory_bus_width,memory_clock", "--format=csv,noheader")
	out, err := cmd.Output()
	if err != nil {
		return 0
	}

	fields := strings.Split(strings.TrimSpace(string(out)), ",")
	if len(fields) != 2 {
		return 0
	}

	busWidth, err1 := strconv.ParseFloat(strings.TrimSpace(fields[0]), 64)
	memClock, err2 := strconv.ParseFloat(strings.TrimSpace(fields[1]), 64)
	
	if err1 != nil || err2 != nil {
		return 0
	}

	// Calculate bandwidth: (memory_clock * 2 * bus_width) / 8 / 1000 = GB/s
	bandwidthGBs := (memClock * 2 * busWidth) / 8 / 1000
	return bandwidthGBs
}

func getGPUBandwidthAMD() float64 {
	cmd := exec.Command("rocm-smi", "--showmeminfo", "vram")
	out, err := cmd.Output()
	if err != nil {
		return 0
	}

	// Parse memory clock and bus width from rocm-smi output
	lines := strings.Split(string(out), "\n")
	var memClock, busWidth float64
	
	for _, line := range lines {
		if strings.Contains(line, "Memory Clock Level") {
			fields := strings.Fields(line)
			if len(fields) > 3 {
				memClock, _ = strconv.ParseFloat(fields[3], 64)
			}
		}
		if strings.Contains(line, "Memory Bus Width") {
			fields := strings.Fields(line)
			if len(fields) > 3 {
				busWidth, _ = strconv.ParseFloat(fields[3], 64)
			}
		}
	}

	if memClock == 0 || busWidth == 0 {
		return 0
	}

	// Calculate bandwidth similar to NVIDIA
	return (memClock * 2 * busWidth) / 8 / 1000
}

func getGPUBandwidthIntel() float64 {
	cmd := exec.Command("intel_gpu_top", "-s")
	out, err := cmd.Output()
	if err != nil {
		return 0
	}

	lines := strings.Split(string(out), "\n")
	for _, line := range lines {
		if strings.Contains(line, "Memory Frequency:") {
			fields := strings.Fields(line)
			if len(fields) > 2 {
				memClock, err := strconv.ParseFloat(fields[2], 64)
				if err != nil {
					return 0
				}
				// Intel GPUs typically have 128-bit memory bus
				const busWidth = 128.0
				return (memClock * 2 * busWidth) / 8 / 1000
			}
		}
	}
	return 0
}

// Rename existing Windows functions
func getCPUInfoWindows() string {
	out, err := execWMIC("cpu", "get", "Name", "/format:list")
	if err != nil {
		log.Printf("Error retrieving CPU info: %v", err)
		return "Unknown"
	}
	for _, line := range strings.Split(out, "\n") {
		if strings.HasPrefix(line, "Name=") {
			return strings.TrimSpace(strings.TrimPrefix(line, "Name="))
		}
	}
	return "Unknown"
}

func getRAMInfoWindows() string {
	out, err := execWMIC("ComputerSystem", "get", "TotalPhysicalMemory", "/format:list")
	if err != nil {
		log.Printf("Error retrieving RAM info: %v", err)
		return "Unknown"
	}
	for _, line := range strings.Split(out, "\n") {
		if strings.HasPrefix(line, "TotalPhysicalMemory=") {
			val := strings.TrimSpace(strings.TrimPrefix(line, "TotalPhysicalMemory="))
			var bytesValue float64
			fmt.Sscanf(val, "%f", &bytesValue)
			gb := math.Ceil(bytesValue / (1024 * 1024 * 1024))
			return fmt.Sprintf("%.0f GB", gb)
		}
	}
	return "Unknown"
}

func getGPUInfoWindows() (string, string, float64) {
	out, err := execWMIC("path", "win32_VideoController", "get", "Name,AdapterRAM", "/format:list")
	if err != nil {
		return "Unknown", "Unknown", 0
	}

	var gpu, vram string
	var bandwidth float64

	lines := strings.Split(out, "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "Name=") {
			gpu = strings.TrimSpace(strings.TrimPrefix(line, "Name="))
			// Detect GPU vendor and use appropriate bandwidth detection
			switch {
			case strings.Contains(strings.ToLower(gpu), "nvidia"):
				bandwidth = getGPUBandwidthNvidia()
			case strings.Contains(strings.ToLower(gpu), "amd") || strings.Contains(strings.ToLower(gpu), "radeon"):
				bandwidth = getGPUBandwidthAMD()
			case strings.Contains(strings.ToLower(gpu), "intel"):
				bandwidth = getGPUBandwidthIntel()
			}
		} else if strings.HasPrefix(line, "AdapterRAM=") {
			val := strings.TrimSpace(strings.TrimPrefix(line, "AdapterRAM="))
			bytes, _ := strconv.ParseFloat(val, 64)
			vram = fmt.Sprintf("%.1f GB", bytes/(1024*1024*1024))
		}
	}

	if gpu == "" {
		gpu = "Unknown"
	}
	if vram == "" {
		vram = "Unknown"
	}

	return gpu, vram, bandwidth
}

// Update getGPUInfoLinux to include bandwidth detection
func getGPUInfoLinux() (string, string, float64) {
	// Try lspci first for GPU model
	gpuCmd := exec.Command("lspci", "-v")
	gpuOut, err := gpuCmd.Output()
	if err != nil {
		return "Unknown", "Unknown", 0
	}

	var gpu, vram string
	var bandwidth float64

	lines := strings.Split(string(gpuOut), "\n")
	for _, line := range lines {
		if strings.Contains(line, "VGA") || strings.Contains(line, "3D") {
			gpu = strings.TrimSpace(strings.Split(line, ":")[2])
			// Detect GPU vendor and use appropriate bandwidth detection
			switch {
			case strings.Contains(strings.ToLower(gpu), "nvidia"):
				bandwidth = getGPUBandwidthNvidia()
			case strings.Contains(strings.ToLower(gpu), "amd") || strings.Contains(strings.ToLower(gpu), "radeon"):
				bandwidth = getGPUBandwidthAMD()
			case strings.Contains(strings.ToLower(gpu), "intel"):
				bandwidth = getGPUBandwidthIntel()
			}
			break
		}
	}

	// Try to get VRAM info
	if strings.Contains(strings.ToLower(gpu), "nvidia") {
		cmd := exec.Command("nvidia-smi", "--query-gpu=memory.total", "--format=csv,noheader,nounits")
		out, err := cmd.Output()
		if err == nil {
			memMB, err := strconv.ParseFloat(strings.TrimSpace(string(out)), 64)
			if err == nil {
				vram = fmt.Sprintf("%.1f GB", memMB/1024)
			}
		}
	}

	if gpu == "" {
		gpu = "Unknown"
	}
	if vram == "" {
		vram = "Unknown"
	}

	return gpu, vram, bandwidth
}

// Add this function to handle OS-specific GPU info retrieval
func getGPUInfo() (string, string, float64) {
	if runtime.GOOS == "windows" {
		return getGPUInfoWindows()
	}
	return getGPUInfoLinux()
}

func main() {
	isDev := flag.Bool("dev", false, "set to true to use development endpoints")
	sessionIDPtr := flag.String("session", "", "session ID for the system check")
	flag.Parse()

	var baseDomain string
	if *isDev {
		baseDomain = "http://localhost:3000"
	} else {
		baseDomain = "https://canyourunai-worker.digitalveilmedia.workers.dev"
	}	

	sessionID := *sessionIDPtr
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	storageInfo := getStorageSpace()
	cpu := getCPUInfo()
	ram := getRAMInfo()
	gpu, vram, gpuBandwidth := getGPUInfo()

	sysInfo := SystemInfo{
		SessionID: sessionID,
		Storage:   storageInfo,
		CPU:       cpu,
		RAM:       ram,
		GPU:       gpu,
		VRAM:      vram,
		GPUBandwidth: gpuBandwidth,
	}

	fmt.Println("System Information:")
	fmt.Printf("Session ID: %s\nStorage: %s\nCPU: %s\nRAM: %s\nGPU: %s\nVRAM: %s\nGPU Bandwidth: %.2f GB/s\n",
		sysInfo.SessionID, sysInfo.Storage, sysInfo.CPU, sysInfo.RAM, sysInfo.GPU, sysInfo.VRAM, sysInfo.GPUBandwidth)

	payload, err := json.Marshal(sysInfo)
	if err != nil {
		log.Fatalf("Failed to marshal system info: %v", err)
	}

	apiURL := fmt.Sprintf("%s/api/system-check", baseDomain)

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(payload))
	if err != nil {
		log.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending POST request: %v", err)
	}
	defer resp.Body.Close()

	fmt.Println("Session id:", sessionID)

	if resp.StatusCode != http.StatusOK {
		log.Printf("Received non-200 response: %d %s", resp.StatusCode, resp.Status)
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}
		fmt.Println("Response Body (non-200):", string(bodyBytes))
		return
	}

	var respData map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		log.Printf("Error decoding response: %v", err)
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}
		fmt.Println("Response Body (error):", string(bodyBytes))
		return
	}

	fmt.Println("Server response:", respData)

	fmt.Println("Press ENTER to exit...")
	_, _ = os.Stdin.Read(make([]byte, 1))
}