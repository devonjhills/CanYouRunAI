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
	"regexp"
	"os/exec"
	"strings"
	"io"
	"io/ioutil"
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

func getGPUInfoLinux() (string, string) {
	// Try lspci first for GPU model
	gpuCmd := exec.Command("lspci", "-v")
	gpuOut, err := gpuCmd.Output()
	if err != nil {
		log.Printf("Error retrieving GPU info: %v", err)
		return "Unknown", "Unknown"
	}
	
	var gpuName string
	lines := strings.Split(string(gpuOut), "\n")
	for _, line := range lines {
		if strings.Contains(strings.ToLower(line), "vga") || 
		   strings.Contains(strings.ToLower(line), "nvidia") || 
		   strings.Contains(strings.ToLower(line), "amd") {
			gpuName = strings.TrimSpace(strings.Split(line, ":")[1])
			break
		}
	}
	
	// Try nvidia-smi for VRAM if available
	vramCmd := exec.Command("nvidia-smi", "--query-gpu=memory.total", "--format=csv,noheader,nounits")
	vramOut, err := vramCmd.Output()
	if err == nil {
		vramMB, err := strconv.ParseFloat(strings.TrimSpace(string(vramOut)), 64)
		if err == nil {
			gb := math.Ceil(vramMB / 1024)
			return gpuName, fmt.Sprintf("%.0f GB", gb)
		}
	}
	
	// If nvidia-smi fails, try checking /sys/class/drm for AMD cards
	files, err := ioutil.ReadDir("/sys/class/drm")
	if err == nil {
		for _, file := range files {
			if strings.HasPrefix(file.Name(), "card") {
				vramPath := fmt.Sprintf("/sys/class/drm/%s/device/mem_info_vram_total", file.Name())
				vramBytes, err := ioutil.ReadFile(vramPath)
				if err == nil {
					vramKB, err := strconv.ParseFloat(strings.TrimSpace(string(vramBytes)), 64)
					if err == nil {
						gb := math.Ceil(vramKB / (1024 * 1024))
						return gpuName, fmt.Sprintf("%.0f GB", gb)
					}
				}
			}
		}
	}
	
	return gpuName, "Unknown"
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

func getGPUInfoWindows() (string, string) {
	// Create a temporary file for dxdiag output
	tmpFile, err := ioutil.TempFile("", "dxdiag-*.txt")
	if err != nil {
		log.Printf("Error creating temp file: %v", err)
		return "Unknown", "Unknown"
	}
	defer os.Remove(tmpFile.Name())
	tmpFile.Close()

	// Run dxdiag and save output to the temp file
	cmd := exec.Command("dxdiag", "/t", tmpFile.Name())
	if err := cmd.Run(); err != nil {
		log.Printf("Error running dxdiag: %v", err)
		return "Unknown", "Unknown"
	}

	// Read the dxdiag output file
	content, err := ioutil.ReadFile(tmpFile.Name())
	if err != nil {
		log.Printf("Error reading dxdiag output: %v", err)
		return "Unknown", "Unknown"
	}

	lines := strings.Split(string(content), "\n")
	var gpuName, vram string
	inDisplaySection := false

	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		if strings.HasPrefix(line, "Card name:") {
			inDisplaySection = true
			gpuName = strings.TrimSpace(strings.TrimPrefix(line, "Card name:"))
		}
		
		if inDisplaySection && strings.HasPrefix(line, "Dedicated Memory:") {
			vramStr := strings.TrimSpace(strings.TrimPrefix(line, "Dedicated Memory:"))
			// Extract the number before " MB"
			re := regexp.MustCompile(`(\d+)\s*MB`)
			if matches := re.FindStringSubmatch(vramStr); len(matches) > 1 {
				mbValue := matches[1]
				var mb float64
				fmt.Sscanf(mbValue, "%f", &mb)
				gb := math.Ceil(mb / 1024)
				vram = fmt.Sprintf("%.0f GB", gb)
				break
			}
		}
	}

	if gpuName == "" {
		gpuName = "Unknown"
	}
	if vram == "" {
		vram = "Unknown"
	}

	return gpuName, vram
}

// Add this function to handle OS-specific GPU info retrieval
func getGPUInfo() (string, string) {
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
	gpu, vram := getGPUInfo()

	sysInfo := SystemInfo{
		SessionID: sessionID,
		Storage:   storageInfo,
		CPU:       cpu,
		RAM:       ram,
		GPU:       gpu,
		VRAM:      vram,
	}

	fmt.Println("System Information:")
	fmt.Printf("Session ID: %s\nStorage: %s\nCPU: %s\nRAM: %s\nGPU: %s\nVRAM: %s\n",
		sysInfo.SessionID, sysInfo.Storage, sysInfo.CPU, sysInfo.RAM, sysInfo.GPU, sysInfo.VRAM)

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