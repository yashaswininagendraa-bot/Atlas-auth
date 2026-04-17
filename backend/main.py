from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from simulation import MachineState, simulate_machines

app = FastAPI(title="ATLAS+ Digital Twin Full-Stack Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulation State Configuration
MACHINES = [
    MachineState(machine_id="M-101", base_temperature=45.0, base_vibration=1.2),
    MachineState(machine_id="M-102", base_temperature=48.0, base_vibration=1.8),
    MachineState(machine_id="M-103", base_temperature=52.0, base_vibration=2.1),
    MachineState(machine_id="M-104", base_temperature=57.0, base_vibration=2.5),
    MachineState(machine_id="M-105", base_temperature=60.0, base_vibration=3.0),
]

@app.get("/api/machines")
def get_machines():
    return {"machines": simulate_machines(MACHINES)}

# Static Assets Mounting
# We use absolute paths to ensure the server finds the 'public' folder regardless of execution context
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

if os.path.exists(PUBLIC_DIR):
    app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")

@app.get("/")
def read_root():
    index_path = os.path.join(PUBLIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Dashboard index not found", "checked_path": index_path}

@app.get("/health")
def health_check():
    return {
        "status": "ATLAS+ Core Server Active", 
        "version": "2.4.0",
        "public_dir": PUBLIC_DIR if os.path.exists(PUBLIC_DIR) else "MISSING"
    }

