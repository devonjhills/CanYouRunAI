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

func getOSInfo() string {
	// Create a temporary file for dxdiag output
	tmpFile, err := ioutil.TempFile("", "dxdiag-*.txt")
	if err != nil {
		log.Printf("Error creating temp file: %v", err)
		return "Unknown"
	}
	defer os.Remove(tmpFile.Name())
	tmpFile.Close()

	// Run dxdiag and save output to the temp file
	cmd := exec.Command("dxdiag", "/t", tmpFile.Name())
	if err := cmd.Run(); err != nil {
		log.Printf("Error running dxdiag: %v", err)
		return "Unknown"
	}

	// Read the dxdiag output file
	content, err := ioutil.ReadFile(tmpFile.Name())
	if err != nil {
		log.Printf("Error reading dxdiag output: %v", err)
		return "Unknown"
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Operating System:") {
			return strings.TrimSpace(strings.TrimPrefix(line, "Operating System:"))
		}
	}
	return "Unknown"
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

func getGPUInfo() (string, string) {
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
				gb := mb / 1024
				vram = fmt.Sprintf("%.1f GB", gb)
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

	osInfo := getOSInfo()  // Now using dxdiag for OS info
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

	fmt.Println("System Information:")
	fmt.Printf("Session ID: %s\nOS: %s\nCPU: %s\nRAM: %s\nGPU: %s\nVRAM: %s\n",
		sysInfo.SessionID, sysInfo.OS, sysInfo.CPU, sysInfo.RAM, sysInfo.GPU, sysInfo.VRAM)

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