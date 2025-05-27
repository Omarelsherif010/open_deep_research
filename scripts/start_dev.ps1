# PowerShell script to start the development environment
# This script starts both the FastAPI backend and Next.js frontend

# Activate the virtual environment if it exists
if (Test-Path .\new_venv\Scripts\Activate.ps1) {
    .\new_venv\Scripts\Activate.ps1
}

# Check if required packages are installed
$requiredPackages = @("fastapi", "uvicorn")
foreach ($package in $requiredPackages) {
    if (-not (pip list | Select-String -Pattern "^$package\s").Matches.Success) {
        Write-Host "Installing $package..."
        pip install $package
    }
}

# Start the FastAPI backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\api'; uvicorn main:app --reload --port 8000"

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js to run the frontend."
    exit 1
}

# Navigate to the frontend directory
cd $PSScriptRoot\..\frontend

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path .\node_modules)) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

# Start the Next.js frontend
npm run dev
