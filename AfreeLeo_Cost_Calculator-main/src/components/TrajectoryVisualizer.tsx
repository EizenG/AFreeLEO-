import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

interface TrajectoryVisualizerProps {
  satelliteTrajectory: Array<{
    time: string;
    latitude: number;
    longitude: number;
    altitude: number;
  }>;
  upperstageTrajectory: Array<{
    time: string;
    altitude: number;
  }>;
}

const TrajectoryVisualizer = ({
  satelliteTrajectory,
  upperstageTrajectory,
}: TrajectoryVisualizerProps) => {
  // Prepare data for altitude profile (both objects)
  const altitudeProfileData = [
    ...satelliteTrajectory.map((point, index) => ({
      time: index * 10, // Sampled every 10 data points
      satelliteAltitude: point.altitude,
      upperstageAltitude: upperstageTrajectory[index]?.altitude || null,
    })),
  ];

  // Prepare ground track data (satellite only)
  const groundTrackData = satelliteTrajectory.map((point) => ({
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.altitude,
  }));

  // Prepare upper stage descent data
  const upperstageDescentData = upperstageTrajectory.map((point, index) => ({
    time: index * 5, // Sampled every 5 data points
    altitude: point.altitude,
  }));

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">📊 Trajectory Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="altitude" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="altitude">Altitude Profile</TabsTrigger>
            <TabsTrigger value="groundtrack">Ground Track</TabsTrigger>
            <TabsTrigger value="upperstage">Upper Stage Descent</TabsTrigger>
          </TabsList>

          {/* Tab 1: Altitude Profile - Both Objects */}
          <TabsContent value="altitude" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                🛰️ Satellite vs 🚀 Upper Stage Altitude
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={altitudeProfileData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    label={{ value: "Time (seconds)", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: "Altitude (km)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="satelliteAltitude"
                    stroke="#06b6d4"
                    name="Satellite"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="upperstageAltitude"
                    stroke="#ef4444"
                    name="Upper Stage"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-sm text-slate-400">
                <p>• <span className="text-cyan-400">Cyan line</span>: Satellite remains in orbit (~750 km)</p>
                <p>• <span className="text-red-400">Red line</span>: Upper stage descends after Eco-Brake burn</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Ground Track - Satellite Only */}
          <TabsContent value="groundtrack" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                🗺️ Satellite Ground Track (Earth Surface Projection)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    type="number"
                    dataKey="longitude"
                    domain={[-180, 180]}
                    stroke="#94a3b8"
                    label={{ value: "Longitude (°)", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="latitude"
                    domain={[-90, 90]}
                    stroke="#94a3b8"
                    label={{ value: "Latitude (°)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value: number, name: string) => {
                      if (name === "altitude") return `${value.toFixed(2)} km`;
                      return value.toFixed(2);
                    }}
                  />
                  <Scatter
                    name="Satellite Path"
                    data={groundTrackData}
                    fill="#06b6d4"
                    line={{ stroke: "#06b6d4", strokeWidth: 2 }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="text-sm text-slate-400">
                <p>• Shows the satellite's path projected onto Earth's surface</p>
                <p>• Each point represents the sub-satellite point (nadir)</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Upper Stage Descent */}
          <TabsContent value="upperstage" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                🚀 Upper Stage Deorbit Profile (Eco-Brake)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={upperstageDescentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    label={{ value: "Time (seconds)", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: "Altitude (km)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="altitude"
                    stroke="#ef4444"
                    name="Upper Stage Altitude"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-sm text-slate-400">
                <p>• Red curve shows the upper stage descending after Eco-Brake activation</p>
                <p>• Steeper descent indicates successful deorbit maneuver</p>
                <p>• Target: Atmospheric reentry at ~100-120 km altitude</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrajectoryVisualizer;
