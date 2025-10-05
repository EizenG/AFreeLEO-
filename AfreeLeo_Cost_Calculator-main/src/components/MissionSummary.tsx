import { FormData } from "@/pages/Index";
import { Badge } from "@/components/ui/badge";
import { Satellite, Orbit, Leaf } from "lucide-react";

interface MissionSummaryProps {
  formData: FormData;
}

const MissionSummary = ({ formData }: MissionSummaryProps) => {
  const orbitTypeLabels: Record<string, string> = {
    equatorial: "Equatorial (~0°)",
    heliosynchronous: "Heliosynchronous (~98°)",
    polar: "Polar (~90°)",
    custom: "Custom",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 sticky top-24 card-hover">
      <div className="flex items-center gap-2 mb-6">
        <Satellite className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Mission Summary</h3>
      </div>

      <div className="space-y-4">
        {/* Mission Name */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Mission Name</p>
          <p className="text-sm font-medium text-foreground">
            {formData.missionName || "—"}
          </p>
        </div>

        {/* Satellite Name */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Satellite</p>
          <p className="text-sm font-medium text-foreground">
            {formData.satelliteName || "—"}
          </p>
        </div>

        {/* Mass */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Mass</p>
          <p className="text-sm font-medium text-foreground">
            {formData.satelliteMass > 0 ? `${formData.satelliteMass} kg` : "—"}
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Orbit className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Orbital Parameters
            </p>
          </div>

          {/* Altitude */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Target Altitude</p>
            <p className="text-sm font-medium text-foreground">
              {formData.targetAltitude} km
            </p>
          </div>

          {/* Orbit Type */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Orbit Type</p>
            <Badge variant="secondary" className="text-xs">
              {orbitTypeLabels[formData.orbitType]}
            </Badge>
          </div>

          {/* Eccentricity */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Eccentricity</p>
            <p className="text-sm font-medium text-foreground">
              {formData.eccentricity === 0 ? "Circular" : formData.eccentricity}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Sustainability
            </p>
          </div>

          {/* Eco-Brake Status */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Eco-Brake</p>
            {formData.ecoBrakeEnabled ? (
              <Badge className="bg-primary/10 text-primary border border-primary/20">
                ✓ Enabled
              </Badge>
            ) : (
              <Badge variant="outline">Disabled</Badge>
            )}
          </div>

          {formData.ecoBrakeEnabled && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Max Deorbit Time</p>
              <p className="text-sm font-medium text-foreground">
                {formData.maxDeorbitTime} day{formData.maxDeorbitTime > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionSummary;