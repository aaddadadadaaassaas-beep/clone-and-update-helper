import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    type: "increase" | "decrease" | "neutral";
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "danger":
        return "border-danger/20 bg-danger/5";
      default:
        return "border-border";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "text-success bg-success/10";
      case "warning":
        return "text-warning bg-warning/10";
      case "danger":
        return "text-danger bg-danger/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend.type) {
      case "increase":
        return "text-success bg-success/10";
      case "decrease":
        return "text-danger bg-danger/10";
      case "neutral":
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <Card className={cn(
      "transition-smooth hover:shadow-md",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          getIconStyles()
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-3">
            <Badge 
              variant="outline" 
              className={cn("px-2 py-1", getTrendColor())}
            >
              <span className="text-xs font-medium">
                {trend.type === "increase" ? "+" : trend.type === "decrease" ? "-" : ""}
                {Math.abs(trend.value)}%
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;