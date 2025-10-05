# Backend Configuration Guide

## GMAT Configuration

The backend requires GMAT (General Mission Analysis Tool) to run mission simulations. You need to configure the paths to your GMAT installation.

### Setup Instructions

1. **Install GMAT**
   - Download GMAT from: https://gmat.gsfc.nasa.gov/
   - Install it on your system

2. **Configure GMAT Paths**
   - Copy `config.example.json` to `config.json`
   - Edit `config.json` with your GMAT installation paths

   ```json
   {
     "gmat": {
       "bin_dir": "C:/Path/To/Your/GMAT/bin",
       "output_dir": "C:/Path/To/Your/GMAT/output"
     }
   }
   ```

   **Example paths:**
   - Windows: `C:/Program Files/GMAT/R2025a/bin`
   - Linux: `/usr/local/GMAT/R2025a/bin`
   - macOS: `/Applications/GMAT.app/bin`

3. **Verify Configuration**
   - The backend will check if `GmatConsole.exe` (Windows) or `GmatConsole` (Linux/macOS) exists in the `bin_dir`
   - Run the health check: `curl http://localhost:5000/api/health`

### Running the Backend

```bash
# Install Python dependencies
pip install flask flask-cors

# Start the Flask server
python script.py
```

The server will start on `http://localhost:5000`

### Mission Data Organization

Each mission's data is stored in `missions_data/{mission_id}/`:
```
missions_data/
└── {mission_id}/
    ├── input.json                          # Mission parameters
    ├── results.json                        # Complete results
    ├── mission_{mission_id}.script         # GMAT script
    ├── mission_{mission_id}_satellite.txt  # Satellite trajectory data
    └── mission_{mission_id}_upperstage.txt # Upper stage trajectory data
```

All mission files are now consolidated in one folder for easy management and portability.

### Troubleshooting

- **"GMAT not found"**: Check that `bin_dir` points to the correct GMAT binary folder
- **"Output files not generated"**: Ensure `output_dir` has write permissions
- **"Configuration file not found"**: Make sure `config.json` exists in the project root

### Notes for Different Users

When sharing this project:
1. Do NOT commit `config.json` (it's in `.gitignore`)
2. Share `config.example.json` as a template
3. Each user should create their own `config.json` with their GMAT paths
