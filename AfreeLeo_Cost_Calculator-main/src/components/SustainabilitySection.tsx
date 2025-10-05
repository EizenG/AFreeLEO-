import { useEffect } from "react";
import { FormData } from "@/pages/Index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface SustainabilitySectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  updateSectionCompletion: (section: string, completed: boolean) => void;
}

const SustainabilitySection = ({ formData, updateFormData, updateSectionCompletion }: SustainabilitySectionProps) => {
  useEffect(() => {
    updateSectionCompletion("sustainability", true);
  }, []);

  return (
    <Card className="card-hover border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg">♻️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>4. Sustainability Options</CardTitle>
              <Badge className="bg-primary/10 text-primary border border-primary/20">
                🌱 Zero Debris
              </Badge>
            </div>
            <CardDescription>Eco-Brake system for clean deorbiting</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eco-Brake Toggle */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="space-y-1">
            <Label htmlFor="ecoBrake" className="cursor-pointer text-base">
              Enable Eco-Brake
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatic deorbiting for responsible space missions
            </p>
          </div>
          <Switch
            id="ecoBrake"
            checked={formData.ecoBrakeEnabled}
            onCheckedChange={(checked) => updateFormData("ecoBrakeEnabled", checked)}
          />
        </div>

        {/* Max Deorbit Time (only shown if Eco-Brake enabled) */}
        {formData.ecoBrakeEnabled && (
          <div className="space-y-2 animate-slide-in">
            <Label htmlFor="maxDeorbitTime">
              Maximum Deorbit Time (days)
            </Label>
            <Input
              id="maxDeorbitTime"
              type="number"
              min={1}
              max={90}
              value={formData.maxDeorbitTime}
              onChange={(e) => updateFormData("maxDeorbitTime", parseInt(e.target.value) || 2)}
            />
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${formData.maxDeorbitTime <= 2 ? 'bg-primary animate-glow' : 'bg-muted-foreground'}`} />
              <p className="text-xs text-muted-foreground">
                {formData.maxDeorbitTime <= 2 
                  ? "✓ Recommended: ≤ 48h for rapid deorbiting" 
                  : "Consider faster deorbiting (≤ 48h)"}
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h4 className="text-sm font-semibold mb-2 text-foreground">What is Eco-Brake?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eco-Brake is an innovative deorbiting system that ensures your satellite 
            re-enters the atmosphere in a controlled manner, eliminating any risk of 
            persistent space debris. It's our commitment to a clean and sustainable space environment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilitySection;