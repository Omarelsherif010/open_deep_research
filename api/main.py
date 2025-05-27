from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
from pathlib import Path
import os

# Add the parent directory to sys.path to allow relative imports
parent_dir = str(Path(__file__).parent.parent)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import routers
from routers import projects, documents

app = FastAPI(title="Open Deep Research API", 
              description="API for Technical Due Diligence with AI agents",
              version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router)
app.include_router(documents.router)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount the uploads directory for serving files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to Open Deep Research API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/tdd/domains")
async def get_domains():
    """Get available TDD domains."""
    return {
        "domains": [
            "tech_stack",
            "architecture",
            "sdlc",
            "infrastructure",
            "security"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
