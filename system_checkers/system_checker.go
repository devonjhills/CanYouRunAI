// system_checker.go
// GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o CanYouRunAI.exe system_checker.go

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
	"runtime"
	"strings"
	"io"

	"github.com/google/uuid"
)

// SystemInfo holds the system details.
type SystemInfo struct {
	SessionID string `json:"sessionId"`
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
	// Use a command-line flag to determine the environment.
	// For example, run with "-dev" for development.
	isDev := flag.Bool("dev", false, "set to true to use development endpoints")
	sessionIDPtr := flag.String("session", "", "session ID for the system check")
	flag.Parse()

	// Set the base domain based on the environment.
	var baseDomain string
	if *isDev {
		baseDomain = "http://localhost:3000"  // Development server (if any)
	} else {
		baseDomain = "https://canyourunai-worker.digitalveilmedia.workers.dev"  // Cloudflare Worker URL
	}	

	// Generate a new session ID if not provided.
	sessionID := *sessionIDPtr
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	// Gather system information.
	osInfo := runtime.GOOS
	cpu := getCPUInfo()
	ram := getRAMInfo()
	gpu, vram := getGPUInfo()

	sysInfo := SystemInfo{
		SessionID: sessionID,
		OS:        osInfo,
		CPU:       cpu,
		RAM:       ram,
		GPU:       gpu,
		VRAM:      vram,
	}

	// Display the gathered system information.
	fmt.Println("System Information:")
	fmt.Printf("Session ID: %s\nOS: %s\nCPU: %s\nRAM: %s\nGPU: %s\nVRAM: %s\n",
		sysInfo.SessionID, sysInfo.OS, sysInfo.CPU, sysInfo.RAM, sysInfo.GPU, sysInfo.VRAM)

	// Prepare the JSON payload.
	payload, err := json.Marshal(sysInfo)
	if err != nil {
		log.Fatalf("Failed to marshal system info: %v", err)
	}

	// Build the API endpoint URL.
	apiURL := fmt.Sprintf("%s/api/system-check", baseDomain)

	// Send the POST request with system information.
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

	// Check if the response is a success (HTTP 200 OK)
	if resp.StatusCode != http.StatusOK {
		log.Printf("Received non-200 response: %d %s", resp.StatusCode, resp.Status)
		
		// Read and print the response body to help with debugging
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}
		fmt.Println("Response Body (non-200):", string(bodyBytes))
		return
	}

	// Decode and display the server response.
	var respData map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		log.Printf("Error decoding response: %v", err)

		// Read and print the response body to help with debugging
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}
		fmt.Println("Response Body (error):", string(bodyBytes))
		return
	}

	fmt.Println("Server response:", respData)

	// Construct the URL to open in the browser
	openURL := fmt.Sprintf("%s/api/system-check?session=%s", baseDomain, sessionID)

	// Open the URL in the default browser
	var openCmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		openCmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", openURL)
	case "darwin":
		openCmd = exec.Command("open", openURL)
	case "linux":
		openCmd = exec.Command("xdg-open", openURL)
	default:
		fmt.Printf("Cannot open browser. OS not supported: %s\n", runtime.GOOS)
		return
	}
	err = openCmd.Start()
    if err != nil {
        log.Printf("Error opening browser: %v", err)
    }

	// Keep the console open until a key is pressed (optional).
	fmt.Println("Press ENTER to exit...")
	_, _ = os.Stdin.Read(make([]byte, 1))
}
