import { CheckCircle2, Circle } from "lucide-react";

interface ProgressBarProps {
  completedSections: {
    general: boolean;
    orbital: boolean;
    launch: boolean;
    sustainability: boolean;
  };
}

const ProgressBar = ({ completedSections }: ProgressBarProps) => {
  const sections = [
    { key: "general", label: "General Info", completed: completedSections.general },
    { key: "orbital", label: "Orbital Parameters", completed: completedSections.orbital },
    { key: "launch", label: "Launch", completed: completedSections.launch },
    { key: "sustainability", label: "Sustainability", completed: completedSections.sustainability },
  ];

  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const progressPercentage = (completedCount / sections.length) * 100;

  return (
    <div className="bg-card rounded-lg p-6 border border-border card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Mission Progress
        </h3>
        <span className="text-sm font-semibold text-primary">
          {completedCount}/{sections.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Section Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 transition-all duration-300"
          >
            {section.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-xs font-medium ${section.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;