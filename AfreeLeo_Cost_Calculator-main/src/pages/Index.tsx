import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GeneralInfoSection from "@/components/GeneralInfoSection";
import OrbitalParametersSection from "@/components/OrbitalParametersSection";
import LaunchParametersSection from "@/components/LaunchParametersSection";
import SustainabilitySection from "@/components/SustainabilitySection";
import MissionSummary from "@/components/MissionSummary";
import ProgressBar from "@/components/ProgressBar";
import ResultsDisplay from "./ResultsDisplay";

export interface FormData {
  missionName: string;
  satelliteName: string;
  satelliteMass: number;
  launcherTier: string; // PD-1, PD-2, or PD-3
  targetAltitude: number;
  orbitType: string;
  customInclination: number;
  eccentricity: number;
  missionDuration: number;
  missionDurationUnit: string;
  launchDate: string;
  flexibleWindow: boolean;
  useCustomDropPoint: boolean;
  latitude: number;
  longitude: number;
  dropAltitude: number;
  ecoBrakeEnabled: boolean;
  maxDeorbitTime: number;
  deorbitMode: string;
  telemetryTracking: boolean;
  insurance: boolean;
  satelliteValue: number;
}

export interface MissionResults {
  success: boolean;
  mission_id: string;
  mission_name: string;
  timestamp: string;
  metrics: {
    orbital_params: {
      sma: number;
      altitude: number;
      period_minutes: number;
      velocity_km_s: number;
      revolutions_per_day: number;
    };
    satellite: {
      initial_altitude_km: number;
      final_altitude_km: number;
      status: string;
    };
    upper_stage_deorbit: {
      initial_fuel_kg: number;
      fuel_consumed_kg: number;
      delta_v_m_s: number;
      deorbit_time_minutes: number;
      initial_altitude_km: number;
      final_altitude_km: number;
    };
    mass: {
      upper_stage_initial_kg: number;
      upper_stage_final_kg: number;
    };
  };
  costs: {
    launcher_tier: string;
    breakdown: {
      [key: string]: number;
    };
    subtotal: number;
    total: number;
    currency: string;
  };
  satellite_trajectory: Array<{
    time: string;
    latitude: number;
    longitude: number;
    altitude: number;
  }>;
  upperstage_trajectory: Array<{
    time: string;
    altitude: number;
  }>;
  files: {
    satellite_report: string;
    upperstage_report: string;
    script: string;
  };
}

const API_URL = "http://localhost:5000/api";

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    missionName: "",
    satelliteName: "",
    satelliteMass: 0,
    launcherTier: "PD-1",
    targetAltitude: 400,
    orbitType: "equatorial_dakar",
    customInclination: 98,
    eccentricity: 0,
    missionDuration: 12,
    missionDurationUnit: "months",
    launchDate: "",
    flexibleWindow: false,
    useCustomDropPoint: false,
    latitude: 14.7167,
    longitude: -17.4677,
    dropAltitude: 12,
    ecoBrakeEnabled: true,
    maxDeorbitTime: 2,
    deorbitMode: "rapid",
    telemetryTracking: false,
    insurance: false,
    satelliteValue: 0,
  });

  const [completedSections, setCompletedSections] = useState({
    general: false,
    orbital: false,
    launch: false,
    sustainability: false,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<MissionResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSectionCompletion = (section: keyof typeof completedSections, completed: boolean) => {
    setCompletedSections(prev => ({ ...prev, [section]: completed }));
  };

  const isFormValid = () => {
    return (
      formData.missionName.trim() !== "" &&
      formData.satelliteName.trim() !== "" &&
      formData.satelliteMass > 0 &&
      formData.satelliteMass <= 50 &&
      formData.targetAltitude >= 300 &&
      formData.targetAltitude <= 800 &&
      formData.launchDate !== ""
    );
  };

  const mapFormDataToAPI = () => {
    // Map form data to API expected format
    const missionDurationYears = formData.missionDurationUnit === "years" 
      ? formData.missionDuration 
      : formData.missionDuration / 12;

    return {
      mission_name: formData.missionName,
      satellite_name: formData.satelliteName,
      satellite_mass: formData.satelliteMass,
      launcher_tier: formData.launcherTier,
      target_altitude: formData.targetAltitude,
      orbit_type: formData.orbitType,
      custom_inclination: formData.customInclination,
      eccentricity: formData.eccentricity,
      launch_date: formData.launchDate,
      flexible_window: formData.flexibleWindow,
      deorbit_mode: formData.deorbitMode,
      mission_duration_years: missionDurationYears,
      telemetry_tracking: formData.telemetryTracking,
      insurance: formData.insurance,
      satellite_value: formData.satelliteValue,
      use_custom_drop_point: formData.useCustomDropPoint,
      drop_point: formData.useCustomDropPoint ? {
        latitude: formData.latitude,
        longitude: formData.longitude,
        altitude: formData.dropAltitude
      } : null
    };
  };

  const handleCalculate = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields", {
        description: "Mass: 1-50kg, Altitude: 300-800km",
      });
      return;
    }

    setIsCalculating(true);
    setShowResults(false);

    try {
      const apiPayload = mapFormDataToAPI();
      
      console.log("Sending data to API:", apiPayload);

      const response = await fetch(`${API_URL}/calculate-mission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error calculating mission");
      }

      const data: MissionResults = await response.json();
      
      console.log("Results received:", data);
      
      setResults(data);
      setShowResults(true);

      toast.success("Mission calculated successfully!", {
        description: `Total cost: ${data.costs.total.toLocaleString()} ${data.costs.currency}`,
      });

    } catch (error) {
      console.error("Error:", error);
      toast.error("Calculation error", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      missionName: "",
      satelliteName: "",
      satelliteMass: 0,
      targetAltitude: 400,
      orbitType: "equatorial_dakar",
      customInclination: 98,
      eccentricity: 0,
      missionDuration: 12,
      missionDurationUnit: "months",
      launchDate: "",
      flexibleWindow: false,
      useCustomDropPoint: false,
      latitude: 14.7167,
      longitude: -17.4677,
      dropAltitude: 12,
      ecoBrakeEnabled: true,
      maxDeorbitTime: 2,
      deorbitMode: "rapid",
      telemetryTracking: false,
      insurance: false,
      satelliteValue: 0,
    });
    setCompletedSections({
      general: false,
      orbital: false,
      launch: false,
      sustainability: false,
    });
    setResults(null);
    setShowResults(false);
    toast.info("Form reset");
  };

  const handleDownloadReport = async (fileType: string) => {
    if (!results) return;

    try {
      const url = `${API_URL}/download/${results.mission_id}/${fileType}`;
      window.open(url, '_blank');
      toast.success(`Downloading ${fileType}...`);
    } catch (error) {
      toast.error("Download error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/afreeleo.jpg"
                alt="AFREELEO Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">AFREELEO</h1>
                <p className="text-sm text-slate-400">Mission Planner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <ProgressBar completedSections={completedSections} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {!showResults ? (
              <>
                <GeneralInfoSection
                  formData={formData}
                  updateFormData={updateFormData}
                  updateSectionCompletion={updateSectionCompletion}
                />
                <OrbitalParametersSection
                  formData={formData}
                  updateFormData={updateFormData}
                  updateSectionCompletion={updateSectionCompletion}
                />
                <LaunchParametersSection
                  formData={formData}
                  updateFormData={updateFormData}
                  updateSectionCompletion={updateSectionCompletion}
                />
                <SustainabilitySection
                  formData={formData}
                  updateFormData={updateFormData}
                  updateSectionCompletion={updateSectionCompletion}
                />

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleCalculate}
                    disabled={!isFormValid() || isCalculating}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Calculate Mission
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <ResultsDisplay 
                results={results!} 
                onDownloadReport={handleDownloadReport}
                onNewMission={handleReset}
              />
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <MissionSummary formData={formData} results={results} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;