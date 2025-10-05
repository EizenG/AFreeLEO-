import { useEffect } from "react";
import { FormData } from "@/pages/Index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrbitalParametersSectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  updateSectionCompletion: (section: string, completed: boolean) => void;
}

const OrbitalParametersSection = ({ formData, updateFormData, updateSectionCompletion }: OrbitalParametersSectionProps) => {
  useEffect(() => {
    const isComplete = 
      formData.targetAltitude >= 200 && 
      formData.targetAltitude <= 2000 &&
      formData.orbitType !== "";
    updateSectionCompletion("orbital", isComplete);
  }, [formData.targetAltitude, formData.orbitType]);

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg">🛰️</span>
          </div>
          <div>
            <CardTitle>2. Orbital Parameters</CardTitle>
            <CardDescription>Target orbit configuration</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Altitude with Slider */}
        <div className="space-y-4">
          <Label htmlFor="targetAltitude" className="flex items-center gap-2">
            Target Altitude (km) *
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Between 200 and 2000 km altitude</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          
          <div className="flex items-center gap-4">
            <Slider
              value={[formData.targetAltitude]}
              onValueChange={(value) => updateFormData("targetAltitude", value[0])}
              min={200}
              max={2000}
              step={10}
              className="flex-1"
            />
            <Input
              id="targetAltitude"
              type="number"
              min={200}
              max={2000}
              value={formData.targetAltitude}
              onChange={(e) => updateFormData("targetAltitude", parseInt(e.target.value) || 400)}
              className="w-24"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Current altitude: {formData.targetAltitude} km
          </p>
        </div>

        {/* Orbit Type */}
        <div className="space-y-2">
          <Label htmlFor="orbitType">Orbit Type *</Label>
          <Select
            value={formData.orbitType}
            onValueChange={(value) => updateFormData("orbitType", value)}
          >
            <SelectTrigger id="orbitType">
              <SelectValue placeholder="Select an orbit type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="equatorial">Equatorial (~0°)</SelectItem>
              <SelectItem value="heliosynchronous">Heliosynchronous (~98°)</SelectItem>
              <SelectItem value="polar">Polar (~90°)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Inclination (shown only if custom orbit selected) */}
        {formData.orbitType === "custom" && (
          <div className="space-y-2 animate-slide-in">
            <Label htmlFor="customInclination">Custom Inclination (°)</Label>
            <Input
              id="customInclination"
              type="number"
              min={0}
              max={180}
              step={0.1}
              value={formData.customInclination}
              onChange={(e) => updateFormData("customInclination", parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Eccentricity */}
        <div className="space-y-2">
          <Label htmlFor="eccentricity" className="flex items-center gap-2">
            Eccentricity
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>0 = circular orbit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="eccentricity"
            type="number"
            min={0}
            max={0.9}
            step={0.01}
            value={formData.eccentricity}
            onChange={(e) => updateFormData("eccentricity", parseFloat(e.target.value) || 0)}
          />
          {formData.eccentricity === 0 && (
            <p className="text-xs text-muted-foreground">Circular orbit</p>
          )}
        </div>

        {/* Mission Duration */}
        <div className="space-y-2">
          <Label>Planned Mission Duration</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={formData.missionDuration}
              onChange={(e) => updateFormData("missionDuration", parseInt(e.target.value) || 1)}
              className="flex-1"
            />
            <Select
              value={formData.missionDurationUnit}
              onValueChange={(value) => updateFormData("missionDurationUnit", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrbitalParametersSection;