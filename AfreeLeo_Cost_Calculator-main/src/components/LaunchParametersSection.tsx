import { useEffect } from "react";
import { FormData } from "@/pages/Index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface LaunchParametersSectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  updateSectionCompletion: (section: string, completed: boolean) => void;
}

const LaunchParametersSection = ({ formData, updateFormData, updateSectionCompletion }: LaunchParametersSectionProps) => {
  const [dropPointOpen, setDropPointOpen] = useState(false);

  useEffect(() => {
    const isComplete = formData.launchDate !== "";
    updateSectionCompletion("launch", isComplete);
  }, [formData.launchDate]);

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg">🌍</span>
          </div>
          <div>
            <CardTitle>3. Launch Parameters</CardTitle>
            <CardDescription>Launch date and drop point</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Launch Date */}
        <div className="space-y-2">
          <Label htmlFor="launchDate">Desired Launch Date *</Label>
          <Input
            id="launchDate"
            type="datetime-local"
            value={formData.launchDate}
            onChange={(e) => updateFormData("launchDate", e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Flexible Window */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="flexibleWindow" className="cursor-pointer">
              Flexible Launch Window
            </Label>
            <p className="text-xs text-muted-foreground">
              Accept date adjustments to optimize conditions
            </p>
          </div>
          <Switch
            id="flexibleWindow"
            checked={formData.flexibleWindow}
            onCheckedChange={(checked) => updateFormData("flexibleWindow", checked)}
          />
        </div>

        {/* Drop Point Collapsible */}
        <Collapsible open={dropPointOpen} onOpenChange={setDropPointOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="text-left">
              <p className="text-sm font-medium">Drop Point</p>
              <p className="text-xs text-muted-foreground">
                {dropPointOpen ? "Custom configuration" : "Use default airport (Dakar)"}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${dropPointOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 animate-slide-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step={0.0001}
                  value={formData.latitude}
                  onChange={(e) => updateFormData("latitude", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step={0.0001}
                  value={formData.longitude}
                  onChange={(e) => updateFormData("longitude", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropAltitude">Altitude (km)</Label>
              <Input
                id="dropAltitude"
                type="number"
                step={0.1}
                value={formData.dropAltitude}
                onChange={(e) => updateFormData("dropAltitude", parseFloat(e.target.value) || 0)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default LaunchParametersSection;