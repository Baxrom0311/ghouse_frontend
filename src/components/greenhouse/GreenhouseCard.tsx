import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Greenhouse } from "@/contexts/GreenhouseContext";
import { Leaf, Settings, ArrowRight, Thermometer, Droplets, Wind } from "lucide-react";
import { useTranslation } from "react-i18next";

const statusColors = {
  ok: "neon-green",
  warning: "neon-amber",
  critical: "neon-coral",
};

interface GreenhouseCardProps {
  greenhouse: Greenhouse;
}

const GreenhouseCard: React.FC<GreenhouseCardProps> = ({ greenhouse }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const statusColor = statusColors[greenhouse.status];

  const tempSensor = greenhouse.sensors.find((s) => s.type === "temperature");
  const humiditySensor = greenhouse.sensors.find((s) => s.type === "humidity");
  const moistureSensor = greenhouse.sensors.find((s) => s.type === "soil_moisture");

  const getStatusLabel = () => {
    switch (greenhouse.status) {
      case "ok":
        return t("greenhouse.healthy");
      case "warning":
        return t("greenhouse.warning");
      case "critical":
        return t("greenhouse.critical");
      default:
        return greenhouse.status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glow" className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `hsl(var(--${statusColor}) / 0.2)`,
                  border: `1px solid hsl(var(--${statusColor}) / 0.4)`,
                  boxShadow: `0 0 15px hsl(var(--${statusColor}) / 0.3)`,
                }}
              >
                <Leaf className="w-6 h-6" style={{ color: `hsl(var(--${statusColor}))` }} />
              </div>
              <div>
                <CardTitle className="text-lg">{greenhouse.name}</CardTitle>
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: `hsl(var(--${statusColor}))` }}
                >
                  {getStatusLabel()}
                </span>
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                greenhouse.status === "ok" ? "animate-glow-pulse" : ""
              }`}
              style={{
                backgroundColor: `hsl(var(--${statusColor}))`,
                boxShadow: `0 0 10px hsl(var(--${statusColor}))`,
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Thermometer className="w-4 h-4 mx-auto mb-1 text-primary" />
              <span className="text-lg font-display font-bold text-foreground">
                {tempSensor?.value.toFixed(0)}°
              </span>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Wind className="w-4 h-4 mx-auto mb-1 text-primary" />
              <span className="text-lg font-display font-bold text-foreground">
                {humiditySensor?.value.toFixed(0)}%
              </span>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Droplets className="w-4 h-4 mx-auto mb-1 text-primary" />
              <span className="text-lg font-display font-bold text-foreground">
                {moistureSensor?.value.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* AI Mode Badge */}
          <div
            className={`text-center py-2 rounded-lg text-sm font-medium ${
              greenhouse.aiMode
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {greenhouse.aiMode
              ? `🤖 ${t("greenhouse.aiModeActive")}`
              : `🖐️ ${t("greenhouse.manualControl")}`}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="neon"
              className="flex-1"
              onClick={() => navigate(`/greenhouse/${greenhouse.id}`)}
            >
              {t("greenhouse.open")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/greenhouse/${greenhouse.id}/settings`)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GreenhouseCard;
