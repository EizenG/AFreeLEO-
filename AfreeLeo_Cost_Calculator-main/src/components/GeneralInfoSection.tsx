import { useEffect } from "react";
import { FormData } from "@/pages/Index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, CheckCircle2, XCircle, Rocket } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeneralInfoSectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  updateSectionCompletion: (section: string, completed: boolean) => void;
}

const GeneralInfoSection = ({ formData, updateFormData, updateSectionCompletion }: GeneralInfoSectionProps) => {
  const isMissionNameValid = formData.missionName.trim() !== "";
  const isSatelliteNameValid = formData.satelliteName.trim() !== "";
  const isMassValid = formData.satelliteMass > 0 && formData.satelliteMass <= 1000;

  useEffect(() => {
    const isComplete = isMissionNameValid && isSatelliteNameValid && isMassValid;
    updateSectionCompletion("general", isComplete);
  }, [isMissionNameValid, isSatelliteNameValid, isMassValid]);

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => {
    if (!isValid) return <XCircle className="h-4 w-4 text-destructive" />;
    return <CheckCircle2 className="h-4 w-4 text-primary" />;
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <div>
            <CardTitle>1. General Information</CardTitle>
            <CardDescription>Basic details of your space mission</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mission Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="missionName" className="flex items-center gap-2">
              Mission Name *
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose a unique name to identify your mission</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            {formData.missionName && <ValidationIcon isValid={isMissionNameValid} />}
          </div>
          <Input
            id="missionName"
            placeholder="Ex: CubeSat Dakar-1"
            value={formData.missionName}
            onChange={(e) => updateFormData("missionName", e.target.value)}
            className={!isMissionNameValid && formData.missionName ? "border-destructive" : ""}
          />
          {!isMissionNameValid && formData.missionName && (
            <p className="text-sm text-destructive">Mission name cannot be empty</p>
          )}
        </div>

        {/* Satellite Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="satelliteName">Satellite Name *</Label>
            {formData.satelliteName && <ValidationIcon isValid={isSatelliteNameValid} />}
          </div>
          <Input
            id="satelliteName"
            placeholder="Ex: AFREELEO-SAT-001"
            value={formData.satelliteName}
            onChange={(e) => updateFormData("satelliteName", e.target.value)}
            className={!isSatelliteNameValid && formData.satelliteName ? "border-destructive" : ""}
          />
        </div>

        {/* Launcher Tier Selection */}
        <div className="space-y-2">
          <Label htmlFor="launcherTier" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Launcher Configuration *
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Launcher Tiers:</p>
                  <p>• PD-1: 1-5,660 lbs payload (~2,567 kg)</p>
                  <p>• PD-2: 5,660-12,580 lbs (~5,706 kg)</p>
                  <p>• PD-3: 12,580-17,810 lbs (~8,078 kg)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Select
            value={formData.launcherTier}
            onValueChange={(value) => updateFormData("launcherTier", value)}
          >
            <SelectTrigger id="launcherTier">
              <SelectValue placeholder="Select launcher tier" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="PD-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">PD-1</span>
                  <span className="text-xs text-muted-foreground">Small (≤2,567 kg)</span>
                </div>
              </SelectItem>
              <SelectItem value="PD-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">PD-2</span>
                  <span className="text-xs text-muted-foreground">Medium (≤5,706 kg)</span>
                </div>
              </SelectItem>
              <SelectItem value="PD-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">PD-3</span>
                  <span className="text-xs text-muted-foreground">Large (≤8,078 kg)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="p-3 bg-muted/30 rounded-md text-xs text-muted-foreground">
            <p className="font-medium mb-1">Current Selection: {formData.launcherTier}</p>
            {formData.launcherTier === "PD-1" && <p>3-stage solid rocket + liquid hydrogen configuration</p>}
            {formData.launcherTier === "PD-2" && <p>Liquid hydrogen 2-stage configuration</p>}
            {formData.launcherTier === "PD-3" && <p>Heavy-lift 2-stage liquid hydrogen system</p>}
          </div>
        </div>

        {/* Satellite Mass */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="satelliteMass" className="flex items-center gap-2">
              Satellite Mass (kg) *
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Between 1 and 1000 kg</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            {formData.satelliteMass > 0 && <ValidationIcon isValid={isMassValid} />}
          </div>
          <Input
            id="satelliteMass"
            type="number"
            min={1}
            max={1000}
            placeholder="Ex: 50"
            value={formData.satelliteMass || ""}
            onChange={(e) => updateFormData("satelliteMass", parseFloat(e.target.value) || 0)}
            className={!isMassValid && formData.satelliteMass > 0 ? "border-destructive" : ""}
          />
          {!isMassValid && formData.satelliteMass > 0 && (
            <p className="text-sm text-destructive">Mass must be between 1 and 1000 kg</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoSection;