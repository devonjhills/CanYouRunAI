// system_checker.go
// GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o CanYouRunAI.exe system_checker.go

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

// SystemInfo holds the system details.
type SystemInfo struct {
	SessionId string `json:"sessionId"`
	OS        string `json:"OS"`
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

// getCPUInfo retrieves the CPU name.
func getCPUInfo() string {
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

// getRAMInfo retrieves the total physical memory (in GB).
func getRAMInfo() string {
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
			gb := bytesValue / (1024 * 1024 * 1024)
			return fmt.Sprintf("%.1f GB", gb)
		}
	}
	return "Unknown"
}

// getGPUInfo retrieves the GPU name and VRAM.
// It returns two strings: the first is the GPU name and the second is the VRAM (in GB).
func getGPUInfo() (string, string) {
	out, err := execWMIC("path", "win32_VideoController", "get", "Name,AdapterRAM", "/format:list")
	if err != nil {
		log.Printf("Error retrieving GPU info: %v", err)
		return "Unknown", "Unknown"
	}

	var gpuName, vram string
	lines := strings.Split(out, "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "Name=") && gpuName == "" {
			gpuName = strings.TrimSpace(strings.TrimPrefix(line, "Name="))
		}
		if strings.HasPrefix(line, "AdapterRAM=") && vram == "" {
			val := strings.TrimSpace(strings.TrimPrefix(line, "AdapterRAM="))
			var bytesValue float64
			fmt.Sscanf(val, "%f", &bytesValue)
			gb := bytesValue / (1024 * 1024 * 1024)
			vram = fmt.Sprintf("%.1f GB", gb)
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

func main() {
	
	flag.Parse()

	// Set the worker domain based on environment
	workerDomain := "https://canyourunai-worker.digitalveilmedia.workers.dev"

	// Gather system information first
	osInfo := runtime.GOOS
	cpu := getCPUInfo()
	ram := getRAMInfo()
	gpu, vram := getGPUInfo()

	fmt.Printf("\nSystem Information:\n")
	fmt.Printf("OS: %s\nCPU: %s\nRAM: %s\nGPU: %s\nVRAM: %s\n",
		osInfo, cpu, ram, gpu, vram)

	sysInfo := SystemInfo{
		OS:    osInfo,
		CPU:   cpu,
		RAM:   ram,
		GPU:   gpu,
		VRAM:  vram,
	}

	// Send data to API
	payload, err := json.Marshal(sysInfo)
	if err != nil {
		log.Fatalf("Failed to marshal system info: %v", err)
	}

	apiURL := fmt.Sprintf("%s/api/system-check", workerDomain)
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

	if resp.StatusCode != http.StatusOK {
		log.Printf("Received non-200 response: %d %s", resp.StatusCode, resp.Status)
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}
		fmt.Println("Response Body (non-200):", string(bodyBytes))
	} else {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Printf("Failed to read response body: %v", err)
		} else {
			fmt.Println("Response Body (200):", string(bodyBytes))
		}
		fmt.Println("\nSystem information sent successfully!")
	}

	fmt.Println("\nPress ENTER to exit...")
	_, _ = os.Stdin.Read(make([]byte, 1))
}
