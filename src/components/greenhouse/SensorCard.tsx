import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SensorData } from "@/contexts/GreenhouseContext";
import { Droplets, Thermometer, Wind, Cloud, Sun, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const iconMap = {
  soil_moisture: Droplets,
  humidity: Cloud,
  temperature: Thermometer,
  co2: Wind,
  light: Sun,
};

const statusColors = {
  good: "neon-green",
  warning: "neon-amber",
  critical: "neon-coral",
  unknown: "muted-foreground",
};

const sensorNameKeys: Record<string, string> = {
  soil_moisture: "sensors.soilMoisture",
  humidity: "sensors.airHumidity",
  temperature: "sensors.temperature",
  co2: "sensors.co2Level",
  light: "sensors.lightIntensity",
};

interface SensorCardProps {
  sensor: SensorData;
  greenhouseId: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor, greenhouseId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const Icon = iconMap[sensor.type];
  const statusColor = statusColors[sensor.status];
  const sensorName = t(sensorNameKeys[sensor.type]);
  const progressWidth =
    sensor.value === null || sensor.max === sensor.min
      ? 0
      : Math.min(
          100,
          Math.max(
            0,
            ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100,
          ),
        );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="sensor" className="relative overflow-hidden">
        {/* Pulse animation for real-time updates */}
        <motion.div
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ backgroundColor: `hsl(var(--${statusColor}))` }}
        />

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center sensor-icon-glow"
              style={{
                backgroundColor: `hsl(var(--${statusColor}) / 0.2)`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: `hsl(var(--${statusColor}))` }} />
            </div>
            <CardTitle className="text-base">{sensorName}</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Value Display */}
            <div className="text-center py-4">
              {sensor.value === null ? (
                <div className="space-y-1">
                  <span className="font-display text-3xl font-bold text-muted-foreground">—</span>
                  <p className="text-xs text-muted-foreground">Ma'lumot kutilmoqda</p>
                </div>
              ) : (
                <>
                  <motion.span
                    key={sensor.value}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="font-display text-4xl font-bold sensor-value-glow"
                    style={{
                      color: `hsl(var(--${statusColor}))`,
                    }}
                  >
                    {sensor.value.toFixed(1)}
                  </motion.span>
                  <span className="text-muted-foreground ml-1 text-lg">{sensor.unit}</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("sensors.min")}: {sensor.min}</span>
                <span>{t("sensors.max")}: {sensor.max}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: `${progressWidth}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full sensor-progress-glow"
                  style={{
                    backgroundColor: `hsl(var(--${statusColor}))`,
                  }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: `hsl(var(--${statusColor}) / 0.2)`,
                  color: `hsl(var(--${statusColor}))`,
                  border: `1px solid hsl(var(--${statusColor}) / 0.4)`,
                }}
              >
                {t(`sensors.${sensor.status}`)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/greenhouse/${greenhouseId}/analytics?sensor=${sensor.id}`)}
                className="text-muted-foreground hover:text-primary"
              >
                <LineChart className="w-4 h-4 mr-1" />
                {t("sensors.chart")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(SensorCard);
