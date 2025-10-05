"""
AFREELEO Mission Calculator Backend
Flask API pour génération et exécution de missions GMAT
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import uuid
import json
import math
from datetime import datetime
import shutil
from pathlib import Path
import csv

app = Flask(__name__)
CORS(app)

# Load configuration from config.json
def load_config():
    """Load GMAT paths from config.json"""
    config_path = Path(__file__).parent / "config.json"
    if not config_path.exists():
        raise FileNotFoundError(
            f"Configuration file not found: {config_path}\n"
            "Please create config.json with GMAT installation paths."
        )
    with open(config_path, 'r') as f:
        return json.load(f)

config = load_config()

# Configuration
GMAT_BIN_DIR = config['gmat']['bin_dir']
GMAT_PATH = os.path.join(GMAT_BIN_DIR, "GmatConsole.exe")
GMAT_OUTPUT_DIR = Path(config['gmat']['output_dir'])
MISSIONS_DIR = Path("./missions_data")
MISSIONS_DIR.mkdir(exist_ok=True)

# Pricing configuration
PRICING_PD1 = {
  "tier": "PD-1 (Small)",
  "base_launch": 48360000,    
  "per_kg": 18837,                 
  "eco_brake_system": 20000,       
  "fuel_per_kg": 400,             
  "telemetry_per_year": 2000,     
  "insurance_rate": 0.03           
}

PRICING_PD2 = {
  "tier": "PD-2 (Medium)",
  "base_launch": 111600000,        
  "per_kg": 19558,                
  "eco_brake_system": 25000,      
  "fuel_per_kg": 420,              
  "telemetry_per_year": 2000,
  "insurance_rate": 0.03
}

PRICING_PD3 = {
  "tier": "PD-3 (Large)",
  "base_launch": 120900000,       
  "per_kg": 14966,                 
  "eco_brake_system": 30000,       
  "fuel_per_kg": 450,
  "telemetry_per_year": 2000,
  "insurance_rate": 0.03
}


class GMATScriptGenerator:
    """Générateur de scripts GMAT personnalisés"""
    
    @staticmethod
    def generate_script(params, mission_id):
        """
        Génère un script GMAT à partir des paramètres client
        """
        # Calculs dérivés
        sma = 6378 + params['target_altitude']

        # Parse launch date and convert to GMAT format (DD Mon YYYY)
        launch_date_str = params['launch_date']
        if 'T' in launch_date_str:
            # ISO datetime format, extract date only
            launch_date_str = launch_date_str.split('T')[0]

        # Convert YYYY-MM-DD to DD Mon YYYY format for GMAT
        try:
            date_obj = datetime.strptime(launch_date_str, '%Y-%m-%d')
            launch_date = date_obj.strftime('%d %b %Y')
        except:
            # Fallback to original if parsing fails
            launch_date = launch_date_str

        # Mapping type d'orbite vers inclinaison
        orbit_inclinations = {
            "equatorial": 0,
            "equatorial_dakar": 14.7,
            "heliosynchronous": 98,
            "polar": 90,
            "custom": params.get('custom_inclination', 14.7)
        }
        inclination = orbit_inclinations.get(params['orbit_type'], 14.7)
        
        # Mapping mode désorbitation vers durée burn
        deorbit_modes = {
            "rapid": 300,      # 5 minutes
            "standard": 120,   # 2 minutes
            "gentle": 60       # 1 minute
        }
        burn_duration = deorbit_modes.get(params['deorbit_mode'], 300)
        
        # Calcul masse carburant pour l'étage supérieur
        # Masse étage = 10% de la masse payload (estimation)
        upper_stage_mass = max(100.0, params['satellite_mass'] * 10)
        # Carburant Eco-Brake = 15% de la masse étage
        upper_stage_fuel = max(15.0, upper_stage_mass * 0.15)

        # Génération du script GMAT
        script = f"""
%==================================================================================
% AFREELEO Mission: {params['mission_name']}
% Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
% Mission ID: {mission_id}
%==================================================================================

%----------------------------------------
%---------- Spacecraft (Satellite Payload)
%----------------------------------------

Create Spacecraft {params['satellite_name'].replace(' ', '_')};
{params['satellite_name'].replace(' ', '_')}.DateFormat = UTCGregorian;
{params['satellite_name'].replace(' ', '_')}.Epoch = '{launch_date} 12:00:00.000';
{params['satellite_name'].replace(' ', '_')}.CoordinateSystem = EarthMJ2000Eq;
{params['satellite_name'].replace(' ', '_')}.DisplayStateType = Keplerian;
{params['satellite_name'].replace(' ', '_')}.SMA = {sma};
{params['satellite_name'].replace(' ', '_')}.ECC = {params.get('eccentricity', 0)};
{params['satellite_name'].replace(' ', '_')}.INC = {inclination};
{params['satellite_name'].replace(' ', '_')}.RAAN = 0;
{params['satellite_name'].replace(' ', '_')}.AOP = 0;
{params['satellite_name'].replace(' ', '_')}.TA = 0;
{params['satellite_name'].replace(' ', '_')}.DryMass = {params['satellite_mass']};
{params['satellite_name'].replace(' ', '_')}.Cd = 2.2;
{params['satellite_name'].replace(' ', '_')}.Cr = 1.8;
{params['satellite_name'].replace(' ', '_')}.DragArea = 0.1;
{params['satellite_name'].replace(' ', '_')}.SRPArea = 0.1;
{params['satellite_name'].replace(' ', '_')}.SPADDragScaleFactor = 1;
{params['satellite_name'].replace(' ', '_')}.SPADSRPScaleFactor = 1;
{params['satellite_name'].replace(' ', '_')}.AtmosDensityScaleFactor = 1;
{params['satellite_name'].replace(' ', '_')}.NAIFId = -10003001;
{params['satellite_name'].replace(' ', '_')}.NAIFIdReferenceFrame = -9003001;
{params['satellite_name'].replace(' ', '_')}.OrbitColor = Cyan;
{params['satellite_name'].replace(' ', '_')}.TargetColor = DarkGray;

%----------------------------------------
%---------- Upper Stage (Rocket Stage 3)
%----------------------------------------

Create Spacecraft UpperStage;
UpperStage.DateFormat = UTCGregorian;
UpperStage.Epoch = '{launch_date} 12:00:00.000';
UpperStage.CoordinateSystem = EarthMJ2000Eq;
UpperStage.DisplayStateType = Keplerian;
UpperStage.SMA = {sma};
UpperStage.ECC = {params.get('eccentricity', 0)};
UpperStage.INC = {inclination};
UpperStage.RAAN = 0;
UpperStage.AOP = 0;
UpperStage.TA = 0.1;
UpperStage.DryMass = {upper_stage_mass};
UpperStage.Cd = 2.2;
UpperStage.Cr = 1.8;
UpperStage.DragArea = 2.5;
UpperStage.SRPArea = 2.5;
UpperStage.SPADDragScaleFactor = 1;
UpperStage.SPADSRPScaleFactor = 1;
UpperStage.AtmosDensityScaleFactor = 1;
UpperStage.NAIFId = -10003002;
UpperStage.NAIFIdReferenceFrame = -9003002;
UpperStage.OrbitColor = Red;
UpperStage.TargetColor = Maroon;

%----------------------------------------
%---------- Hardware (Eco-Brake System for Upper Stage)
%----------------------------------------

Create ChemicalTank EcoBrakeFuelTank;
EcoBrakeFuelTank.AllowNegativeFuelMass = false;
EcoBrakeFuelTank.FuelMass = {upper_stage_fuel};
EcoBrakeFuelTank.Pressure = 1500;
EcoBrakeFuelTank.Temperature = 20;
EcoBrakeFuelTank.RefTemperature = 20;
EcoBrakeFuelTank.Volume = 2.0;
EcoBrakeFuelTank.FuelDensity = 1260;
EcoBrakeFuelTank.PressureModel = PressureRegulated;

Create ChemicalThruster EcoBrakeThruster;
EcoBrakeThruster.CoordinateSystem = Local;
EcoBrakeThruster.Origin = Earth;
EcoBrakeThruster.Axes = VNB;
EcoBrakeThruster.ThrustDirection1 = -1;
EcoBrakeThruster.ThrustDirection2 = 0;
EcoBrakeThruster.ThrustDirection3 = 0;
EcoBrakeThruster.DutyCycle = 1;
EcoBrakeThruster.ThrustScaleFactor = 1;
EcoBrakeThruster.DecrementMass = true;
EcoBrakeThruster.Tank = {{EcoBrakeFuelTank}};
EcoBrakeThruster.MixRatio = [ 1 ];
EcoBrakeThruster.GravitationalAccel = 9.81;
EcoBrakeThruster.C1 = 10;
EcoBrakeThruster.K1 = 200;

UpperStage.Tanks = {{EcoBrakeFuelTank}};
UpperStage.Thrusters = {{EcoBrakeThruster}};

%----------------------------------------
%---------- Burns
%----------------------------------------

Create FiniteBurn DeorbitBurn;
DeorbitBurn.Thrusters = {{EcoBrakeThruster}};
DeorbitBurn.ThrottleLogicAlgorithm = 'MaxNumberOfThrusters';

%----------------------------------------
%---------- ForceModels
%----------------------------------------

Create ForceModel LEOProp_ForceModel;
LEOProp_ForceModel.CentralBody = Earth;
LEOProp_ForceModel.PrimaryBodies = {{Earth}};
LEOProp_ForceModel.PointMasses = {{Luna, Sun}};
LEOProp_ForceModel.SRP = On;
LEOProp_ForceModel.RelativisticCorrection = Off;
LEOProp_ForceModel.ErrorControl = RSSStep;
LEOProp_ForceModel.GravityField.Earth.Degree = 4;
LEOProp_ForceModel.GravityField.Earth.Order = 4;
LEOProp_ForceModel.GravityField.Earth.StmLimit = 100;
LEOProp_ForceModel.GravityField.Earth.PotentialFile = 'JGM2.cof';
LEOProp_ForceModel.GravityField.Earth.TideModel = 'None';
LEOProp_ForceModel.Drag.AtmosphereModel = JacchiaRoberts;
LEOProp_ForceModel.Drag.HistoricWeatherSource = 'ConstantFluxAndGeoMag';
LEOProp_ForceModel.Drag.PredictedWeatherSource = 'ConstantFluxAndGeoMag';
LEOProp_ForceModel.Drag.CSSISpaceWeatherFile = 'SpaceWeather-All-v1.2.txt';
LEOProp_ForceModel.Drag.SchattenFile = 'SchattenPredict.txt';
LEOProp_ForceModel.Drag.F107 = 150;
LEOProp_ForceModel.Drag.F107A = 150;
LEOProp_ForceModel.Drag.MagneticIndex = 3;
LEOProp_ForceModel.Drag.DragModel = 'Spherical';
LEOProp_ForceModel.SRP.Flux = 1367;
LEOProp_ForceModel.SRP.SRPModel = Spherical;
LEOProp_ForceModel.SRP.Nominal_Sun = 149597870.691;

%----------------------------------------
%---------- Propagators
%----------------------------------------

Create Propagator LEOProp;
LEOProp.FM = LEOProp_ForceModel;
LEOProp.Type = RungeKutta89;
LEOProp.InitialStepSize = 60;
LEOProp.Accuracy = 9.999999999999999e-12;
LEOProp.MinStep = 0.001;
LEOProp.MaxStep = 2700;
LEOProp.MaxStepAttempts = 50;
LEOProp.StopIfAccuracyIsViolated = true;

%----------------------------------------
%---------- Subscribers
%----------------------------------------

Create ReportFile SatelliteReport;
SatelliteReport.Filename = 'mission_{mission_id}_satellite.txt';
SatelliteReport.Precision = 16;
SatelliteReport.Add = {{{params['satellite_name'].replace(' ', '_')}.UTCGregorian, {params['satellite_name'].replace(' ', '_')}.ElapsedSecs, {params['satellite_name'].replace(' ', '_')}.Earth.Altitude, {params['satellite_name'].replace(' ', '_')}.Earth.Latitude, {params['satellite_name'].replace(' ', '_')}.Earth.Longitude, {params['satellite_name'].replace(' ', '_')}.EarthMJ2000Eq.VX, {params['satellite_name'].replace(' ', '_')}.EarthMJ2000Eq.VY, {params['satellite_name'].replace(' ', '_')}.EarthMJ2000Eq.VZ}};
SatelliteReport.WriteHeaders = true;
SatelliteReport.LeftJustify = On;
SatelliteReport.ZeroFill = Off;
SatelliteReport.FixedWidth = true;
SatelliteReport.Delimiter = ' ';
SatelliteReport.ColumnWidth = 23;
SatelliteReport.WriteReport = true;

Create ReportFile UpperStageReport;
UpperStageReport.Filename = 'mission_{mission_id}_upperstage.txt';
UpperStageReport.Precision = 16;
UpperStageReport.Add = {{UpperStage.UTCGregorian, UpperStage.ElapsedSecs, UpperStage.Earth.Altitude, UpperStage.EcoBrakeFuelTank.FuelMass, UpperStage.TotalMass}};
UpperStageReport.WriteHeaders = true;
UpperStageReport.LeftJustify = On;
UpperStageReport.ZeroFill = Off;
UpperStageReport.FixedWidth = true;
UpperStageReport.Delimiter = ' ';
UpperStageReport.ColumnWidth = 23;
UpperStageReport.WriteReport = true;

%----------------------------------------
%---------- Mission Sequence
%----------------------------------------

BeginMissionSequence;

Toggle SatelliteReport On;
Toggle UpperStageReport On;

% PHASE 1: Both objects at target altitude (satellite stays, upper stage will deorbit)
Propagate Synchronized LEOProp({params['satellite_name'].replace(' ', '_')}) LEOProp(UpperStage) {{{params['satellite_name'].replace(' ', '_')}.ElapsedSecs = 60}};

% PHASE 2: Upper Stage Eco-Brake Deorbit (satellite continues on orbit)

% Braking maneuver for Upper Stage
BeginFiniteBurn DeorbitBurn(UpperStage);
Propagate Synchronized LEOProp({params['satellite_name'].replace(' ', '_')}) LEOProp(UpperStage) {{UpperStage.ElapsedSecs = {burn_duration}}};
EndFiniteBurn DeorbitBurn(UpperStage);

% PHASE 3: Upper Stage descent (satellite continues orbiting)
Propagate Synchronized LEOProp({params['satellite_name'].replace(' ', '_')}) LEOProp(UpperStage) {{UpperStage.ElapsedSecs = 900}};

Toggle SatelliteReport Off;
Toggle UpperStageReport Off;
"""
        return script


class GMATResultParser:
    """Parser pour extraire les résultats des fichiers GMAT"""
    
    @staticmethod
    def parse_report_file(filepath):
        """Parse un fichier de rapport GMAT"""
        data = []
        with open(filepath, 'r') as f:
            lines = f.readlines()
            if len(lines) < 2:
                return data

            # Parse header manually (space-separated, fixed width)
            header = lines[0].split()

            # Parse data lines
            for line in lines[1:]:
                values = line.split()
                if len(values) >= len(header):
                    # Handle datetime (first column has 4 parts: DD Mon YYYY HH:MM:SS)
                    datetime_val = ' '.join(values[0:4])
                    remaining_values = values[4:]

                    row = {header[0]: datetime_val}
                    for i, val in enumerate(remaining_values):
                        if i + 1 < len(header):
                            row[header[i + 1]] = val

                    data.append(row)
        return data
    
    @staticmethod
    def extract_metrics(satellite_data, upperstage_data):
        """Extrait les métriques clés des données GMAT pour satellite et étage"""

        # Données satellite
        sat_start = satellite_data[0]
        sat_end = satellite_data[-1]

        # Données Upper Stage
        stage_start = upperstage_data[0]
        stage_end = upperstage_data[-1]

        # Détecter le nom du satellite
        sample_key = list(sat_start.keys())[0]
        satellite_name = sample_key.split('.')[0]

        # SATELLITE : Extraire les valeurs
        sat_initial_altitude = float(sat_start.get(f'{satellite_name}.Earth.Altitude', 0))
        sat_final_altitude = float(sat_end.get(f'{satellite_name}.Earth.Altitude', 0))

        # UPPER STAGE : Extraire les valeurs
        stage_initial_altitude = float(stage_start.get('UpperStage.Earth.Altitude', 0))
        stage_initial_fuel = float(stage_start.get('UpperStage.EcoBrakeFuelTank.FuelMass', 0))
        stage_final_fuel = float(stage_end.get('UpperStage.EcoBrakeFuelTank.FuelMass', 0))
        stage_initial_mass = float(stage_start.get('UpperStage.TotalMass', 0))
        stage_final_mass = float(stage_end.get('UpperStage.TotalMass', 0))
        stage_final_altitude = float(stage_end.get('UpperStage.Earth.Altitude', 0))

        # Calculer le temps de désorbitation
        deorbit_time_seconds = len(upperstage_data) * 60  # Approximation

        # Calcul Delta-V pour Upper Stage (équation Tsiolkovski)
        if stage_final_mass > 0 and stage_initial_mass > stage_final_mass:
            isp = 200  # seconds
            g0 = 9.81  # m/s²
            delta_v = isp * g0 * math.log(stage_initial_mass / stage_final_mass)
        else:
            delta_v = 0

        # Calcul période orbitale (basé sur satellite)
        sma_km = 6378 + sat_initial_altitude
        mu_earth = 398600.4418  # km³/s²
        period_seconds = 2 * math.pi * math.sqrt((sma_km ** 3) / mu_earth)
        period_minutes = period_seconds / 60

        # Vitesse orbitale
        velocity = math.sqrt(mu_earth / sma_km)

        return {
            "orbital_params": {
                "sma": round(sma_km, 2),
                "altitude": round(sat_initial_altitude, 2),
                "period_minutes": round(period_minutes, 2),
                "velocity_km_s": round(velocity, 2),
                "revolutions_per_day": round(1440 / period_minutes, 2)
            },
            "satellite": {
                "initial_altitude_km": round(sat_initial_altitude, 2),
                "final_altitude_km": round(sat_final_altitude, 2),
                "status": "In orbit" if sat_final_altitude > 300 else "Deorbited"
            },
            "upper_stage_deorbit": {
                "initial_fuel_kg": round(stage_initial_fuel, 3),
                "fuel_consumed_kg": round(stage_initial_fuel - stage_final_fuel, 3),
                "delta_v_m_s": round(delta_v, 2),
                "deorbit_time_minutes": round(deorbit_time_seconds / 60, 2),
                "initial_altitude_km": round(stage_initial_altitude, 2),
                "final_altitude_km": round(stage_final_altitude, 2)
            },
            "mass": {
                "upper_stage_initial_kg": round(stage_initial_mass, 2),
                "upper_stage_final_kg": round(stage_final_mass, 2)
            }
        }


class CostCalculator:
    """Cost calculator for missions"""

    @staticmethod
    def calculate_costs(params, metrics):
        """Calculate total mission costs based on launcher tier"""

        # Select pricing tier based on launcher
        launcher_tier = params.get('launcher_tier', 'PD-1')
        if launcher_tier == 'PD-2':
            PRICING = PRICING_PD2
        elif launcher_tier == 'PD-3':
            PRICING = PRICING_PD3
        else:
            PRICING = PRICING_PD1

        # Base launch cost
        base_launch = PRICING['base_launch']

        # Cost per kg of satellite (payload)
        mass_cost = params['satellite_mass'] * PRICING['per_kg']

        # Eco-Brake system for upper stage
        eco_brake_cost = PRICING['eco_brake_system']

        # Fuel to deorbit upper stage
        fuel_cost = metrics['upper_stage_deorbit']['fuel_consumed_kg'] * PRICING['fuel_per_kg']

        # Services optionnels
        telemetry_years = params.get('mission_duration_years', 0)
        telemetry_cost = telemetry_years * PRICING['telemetry_per_year'] if params.get('telemetry_tracking', False) else 0

        # Assurance
        satellite_value = params.get('satellite_value', 0)
        insurance_cost = satellite_value * PRICING['insurance_rate'] if params.get('insurance', False) else 0

        # Total
        subtotal = base_launch + mass_cost + eco_brake_cost + fuel_cost
        total = subtotal + telemetry_cost + insurance_cost

        return {
            "launcher_tier": PRICING['tier'],
            "breakdown": {
                "base_launch": base_launch,
                "payload_mass_cost": round(mass_cost, 2),
                "eco_brake_system": eco_brake_cost,
                "upper_stage_deorbit_fuel": round(fuel_cost, 2),
                "telemetry": round(telemetry_cost, 2),
                "insurance": round(insurance_cost, 2)
            },
            "subtotal": round(subtotal, 2),
            "total": round(total, 2),
            "currency": "EUR"
        }


@app.route('/api/calculate-mission', methods=['POST'])
def calculate_mission():
    """
    Endpoint principal pour calculer une mission
    """
    try:
        # Récupérer les données du formulaire
        params = request.json
        
        # Validation basique
        required_fields = ['mission_name', 'satellite_name', 'satellite_mass', 
                          'target_altitude', 'orbit_type', 'launch_date', 'deorbit_mode']
        for field in required_fields:
            if field not in params:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validation des ranges
        if not (1 <= params['satellite_mass'] <= 50):
            return jsonify({"error": "Satellite mass must be between 1 and 50 kg"}), 400
        
        if not (300 <= params['target_altitude'] <= 800):
            return jsonify({"error": "Target altitude must be between 300 and 800 km"}), 400
        
        # Générer un ID unique pour cette mission
        mission_id = str(uuid.uuid4())[:8]
        mission_dir = MISSIONS_DIR / mission_id
        mission_dir.mkdir(exist_ok=True)
        
        # Sauvegarder les paramètres d'entrée
        with open(mission_dir / 'input.json', 'w') as f:
            json.dump(params, f, indent=2)
        
        # Générer le script GMAT
        script_content = GMATScriptGenerator.generate_script(params, mission_id)
        script_path = mission_dir / f'mission_{mission_id}.script'
        
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        # Exécuter GMAT
        try:
            # Convertir en chemin absolu
            script_path_abs = script_path.resolve()

            print(f"[INFO] Starting GMAT execution for mission {mission_id}...")
            result = subprocess.run(
                [GMAT_PATH, '-r', str(script_path_abs)],
                capture_output=True,
                text=True,
                timeout=600,  # 10 minutes timeout pour les simulations
                cwd=str(mission_dir)  # Set working directory for subprocess
            )
            print(f"[INFO] GMAT execution completed with return code: {result.returncode}")

            if result.returncode != 0:
                print(f"[ERROR] GMAT stderr: {result.stderr}")
                return jsonify({
                    "error": "GMAT execution failed",
                    "details": result.stderr
                }), 500

        except subprocess.TimeoutExpired:
            print(f"[ERROR] GMAT execution timeout after 600 seconds")
            return jsonify({"error": "GMAT execution timeout (exceeded 10 minutes)"}), 500

        except Exception as e:
            print(f"[ERROR] GMAT execution error: {str(e)}")
            return jsonify({"error": f"GMAT execution error: {str(e)}"}), 500

        # Parser les résultats depuis le dossier output de GMAT
        satellite_report_path = GMAT_OUTPUT_DIR / f'mission_{mission_id}_satellite.txt'
        upperstage_report_path = GMAT_OUTPUT_DIR / f'mission_{mission_id}_upperstage.txt'

        if not satellite_report_path.exists() or not upperstage_report_path.exists():
            return jsonify({
                "error": "GMAT report files not generated",
                "expected_paths": {
                    "satellite_report": str(satellite_report_path),
                    "upperstage_report": str(upperstage_report_path)
                }
            }), 500

        # Copier les fichiers de sortie GMAT vers le dossier de mission
        try:
            mission_satellite_report = mission_dir / f'mission_{mission_id}_satellite.txt'
            mission_upperstage_report = mission_dir / f'mission_{mission_id}_upperstage.txt'

            shutil.copy2(satellite_report_path, mission_satellite_report)
            shutil.copy2(upperstage_report_path, mission_upperstage_report)

            print(f"[INFO] Copied GMAT output files to mission directory: {mission_dir}")

            # Utiliser les fichiers copiés pour le parsing
            satellite_report_path = mission_satellite_report
            upperstage_report_path = mission_upperstage_report
        except Exception as e:
            print(f"[WARNING] Failed to copy GMAT output files: {str(e)}")
            # Continue avec les fichiers originaux si la copie échoue

        try:
            satellite_data = GMATResultParser.parse_report_file(satellite_report_path)
            upperstage_data = GMATResultParser.parse_report_file(upperstage_report_path)
        except Exception as e:
            return jsonify({
                "error": "Failed to parse GMAT report files",
                "details": str(e)
            }), 500

        # Extraire les métriques
        try:
            metrics = GMATResultParser.extract_metrics(satellite_data, upperstage_data)
        except Exception as e:
            return jsonify({
                "error": "Failed to extract metrics from GMAT data",
                "details": str(e),
                "data_length": {"satellite": len(satellite_data), "upperstage": len(upperstage_data)}
            }), 500
        
        # Calculer les coûts
        costs = CostCalculator.calculate_costs(params, metrics)
        
        # Préparer les données de trajectoire pour visualisation
        # Détecter le nom du satellite dynamiquement
        if satellite_data:
            sample_key = list(satellite_data[0].keys())[0]
            satellite_name = sample_key.split('.')[0]
        else:
            satellite_name = params['satellite_name'].replace(' ', '_')

        # Trajectoire du satellite
        satellite_trajectory = []
        for i in range(0, len(satellite_data), 10):  # Sample tous les 10 points
            row = satellite_data[i]
            satellite_trajectory.append({
                "time": row.get(f'{satellite_name}.UTCGregorian', ''),
                "latitude": float(row.get(f'{satellite_name}.Earth.Latitude', 0)),
                "longitude": float(row.get(f'{satellite_name}.Earth.Longitude', 0)),
                "altitude": float(row.get(f'{satellite_name}.Earth.Altitude', 0))
            })

        # Trajectoire de l'étage supérieur (descente)
        upperstage_trajectory = []
        for i in range(0, len(upperstage_data), 5):  # Plus de points pour voir la descente
            row = upperstage_data[i]
            upperstage_trajectory.append({
                "time": row.get('UpperStage.UTCGregorian', ''),
                "altitude": float(row.get('UpperStage.Earth.Altitude', 0))
            })

        # Construire la réponse complète
        response = {
            "success": True,
            "mission_id": mission_id,
            "mission_name": params['mission_name'],
            "timestamp": datetime.now().isoformat(),
            "metrics": metrics,
            "costs": costs,
            "satellite_trajectory": satellite_trajectory,
            "upperstage_trajectory": upperstage_trajectory,
            "files": {
                "satellite_report": f"/api/download/{mission_id}/satellite_report",
                "upperstage_report": f"/api/download/{mission_id}/upperstage_report",
                "script": f"/api/download/{mission_id}/script"
            }
        }
        
        # Sauvegarder la réponse complète
        with open(mission_dir / 'results.json', 'w') as f:
            json.dump(response, f, indent=2)
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@app.route('/api/download/<mission_id>/<file_type>', methods=['GET'])
def download_file(mission_id, file_type):
    """
    Endpoint pour télécharger les fichiers de mission
    """
    mission_dir = MISSIONS_DIR / mission_id

    if not mission_dir.exists():
        return jsonify({"error": "Mission not found"}), 404

    # Chercher d'abord dans le dossier de mission, puis dans le dossier output de GMAT (pour anciennes missions)
    if file_type == "satellite_report" or file_type == "mission_report":  # Legacy support
        # Chercher d'abord dans le dossier de mission
        file_path = mission_dir / f'mission_{mission_id}_satellite.txt'
        if not file_path.exists():
            # Fallback vers le dossier output de GMAT
            file_path = GMAT_OUTPUT_DIR / f'mission_{mission_id}_satellite.txt'
    elif file_type == "upperstage_report" or file_type == "deorbit_report":  # Legacy support
        # Chercher d'abord dans le dossier de mission
        file_path = mission_dir / f'mission_{mission_id}_upperstage.txt'
        if not file_path.exists():
            # Fallback vers le dossier output de GMAT
            file_path = GMAT_OUTPUT_DIR / f'mission_{mission_id}_upperstage.txt'
    elif file_type == "script":
        file_path = mission_dir / f'mission_{mission_id}.script'
    elif file_type == "results":
        file_path = mission_dir / 'results.json'
    elif file_type == "input":
        file_path = mission_dir / 'input.json'
    else:
        return jsonify({"error": "Invalid file type"}), 400

    if not file_path.exists():
        return jsonify({"error": "File not found"}), 404

    return send_file(file_path, as_attachment=True)


@app.route('/api/missions/<mission_id>', methods=['GET'])
def get_mission(mission_id):
    """
    Récupérer les résultats d'une mission existante
    """
    mission_dir = MISSIONS_DIR / mission_id
    results_file = mission_dir / 'results.json'
    
    if not results_file.exists():
        return jsonify({"error": "Mission not found"}), 404
    
    with open(results_file, 'r') as f:
        results = json.load(f)
    
    return jsonify(results)


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "gmat_available": os.path.exists(GMAT_PATH),
        "gmat_path": GMAT_PATH,
        "missions_dir": str(MISSIONS_DIR)
    })


@app.route('/api/validate-params', methods=['POST'])
def validate_params():
    """
    Valide les paramètres avant exécution complète
    """
    params = request.json
    
    errors = []
    
    # Validations
    if params.get('satellite_mass', 0) < 1 or params.get('satellite_mass', 0) > 50:
        errors.append("Satellite mass must be between 1 and 50 kg")
    
    if params.get('target_altitude', 0) < 300 or params.get('target_altitude', 0) > 800:
        errors.append("Target altitude must be between 300 and 800 km")
    
    # Validation date
    try:
        launch_date = datetime.strptime(params.get('launch_date', ''), '%Y-%m-%d')
        if launch_date < datetime.now():
            errors.append("Launch date must be in the future")
    except:
        errors.append("Invalid launch date format (use YYYY-MM-DD)")
    
    if errors:
        return jsonify({"valid": False, "errors": errors}), 400
    
    return jsonify({"valid": True})


if __name__ == '__main__':
    print("AFREELEO Backend Server Starting...")
    print(f"GMAT Path: {GMAT_PATH}")
    print(f"Missions Directory: {MISSIONS_DIR}")
    print(f"GMAT Available: {os.path.exists(GMAT_PATH)}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)