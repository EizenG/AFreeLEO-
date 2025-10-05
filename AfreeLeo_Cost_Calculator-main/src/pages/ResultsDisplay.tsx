import { MissionResults } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import TrajectoryVisualizer from "@/components/TrajectoryVisualizer";

interface ResultsDisplayProps {
  results: MissionResults;
  onDownloadReport: (fileType: string) => void;
  onNewMission: () => void;
}

const ResultsDisplay = ({ results, onDownloadReport, onNewMission }: ResultsDisplayProps) => {
  return (
    <div className="space-y-6">
      {/* Mission Status */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              ✓ Mission Feasible
            </h2>
            <p className="text-slate-300 mb-1">
              Total Cost: <span className="text-3xl font-bold text-white">
                {results.costs.total.toLocaleString()} {results.costs.currency}
              </span>
            </p>
            <p className="text-sm text-slate-400">
              Launcher: <span className="font-semibold text-cyan-400">{results.costs.launcher_tier}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Orbital Parameters */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Orbital Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Altitude</p>
            <p className="text-white font-semibold">{results.metrics.orbital_params.altitude} km</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Period</p>
            <p className="text-white font-semibold">{results.metrics.orbital_params.period_minutes.toFixed(1)} min</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Velocity</p>
            <p className="text-white font-semibold">{results.metrics.orbital_params.velocity_km_s.toFixed(2)} km/s</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Revolutions/day</p>
            <p className="text-white font-semibold">{results.metrics.orbital_params.revolutions_per_day.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Satellite Status */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🛰️ Satellite (Payload)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Initial Altitude</p>
            <p className="text-white font-semibold">{results.metrics.satellite.initial_altitude_km} km</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Final Altitude</p>
            <p className="text-white font-semibold">{results.metrics.satellite.final_altitude_km} km</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-400 text-sm">Status</p>
            <p className="text-green-400 font-semibold text-lg">✓ {results.metrics.satellite.status}</p>
          </div>
        </div>
      </div>

      {/* Upper Stage Eco-Brake Deorbit */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🚀 Upper Stage Deorbit (Eco-Brake)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Initial Fuel</p>
            <p className="text-white font-semibold">{results.metrics.upper_stage_deorbit.initial_fuel_kg.toFixed(2)} kg</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Fuel Consumed</p>
            <p className="text-white font-semibold">{results.metrics.upper_stage_deorbit.fuel_consumed_kg.toFixed(2)} kg</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Fuel Remaining</p>
            <p className="text-white font-semibold">
              {(results.metrics.upper_stage_deorbit.initial_fuel_kg - results.metrics.upper_stage_deorbit.fuel_consumed_kg).toFixed(2)} kg
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Delta-V</p>
            <p className="text-white font-semibold">{results.metrics.upper_stage_deorbit.delta_v_m_s.toFixed(0)} m/s</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Deorbit Time</p>
            <p className="text-white font-semibold">{results.metrics.upper_stage_deorbit.deorbit_time_minutes.toFixed(0)} min</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Final Stage Altitude</p>
            <p className="text-white font-semibold">{results.metrics.upper_stage_deorbit.final_altitude_km.toFixed(0)} km</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(results.costs.breakdown).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-400">{key.replace(/_/g, ' ')}</span>
              <span className="text-white font-semibold">{value.toLocaleString()} EUR</span>
            </div>
          ))}
          <div className="border-t border-slate-700 pt-2 mt-2">
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Total</span>
              <span className="text-cyan-400 font-bold">{results.costs.total.toLocaleString()} EUR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Visualization */}
      <TrajectoryVisualizer
        satelliteTrajectory={results.satellite_trajectory}
        upperstageTrajectory={results.upperstage_trajectory}
      />

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => onDownloadReport('satellite_report')} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Satellite Report
        </Button>
        <Button onClick={() => onDownloadReport('upperstage_report')} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Upper Stage Report
        </Button>
        <Button onClick={onNewMission} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Mission
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;