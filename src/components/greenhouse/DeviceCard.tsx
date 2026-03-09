import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DeviceData } from "@/contexts/GreenhouseContext";
import { Droplets, Wind, Lightbulb, Fan } from "lucide-react";
import { useTranslation } from "react-i18next";

const iconMap = {
  soil_water_pump: Droplets,
  air_water_pump: Wind,
  led: Lightbulb,
  fan: Fan,
};

const deviceNameKeys: Record<string, string> = {
  soil_water_pump: "devices.soilWaterPump",
  air_water_pump: "devices.airHumidifier",
  led: "devices.ledGrowLight",
  fan: "devices.ventilationFan",
};

interface DeviceCardProps {
  device: DeviceData;
  aiMode: boolean;
  onToggle: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  aiMode,
  onToggle,
}) => {
  const { t } = useTranslation();
  const Icon = iconMap[device.type];
  const isDisabled = aiMode;
  const deviceName = t(deviceNameKeys[device.type]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="device"
        className={`relative ${isDisabled ? "opacity-60" : ""} ${
          device.isOn ? "border-primary/60" : ""
        }`}
      >
        {/* Status Indicator */}
        <div
          className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
            device.isOn ? "bg-neon-green animate-glow-pulse" : "bg-muted"
          }`}
          style={
            device.isOn
              ? { boxShadow: "0 0 10px hsl(var(--neon-green))" }
              : undefined
          }
        />

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                device.isOn
                  ? "bg-primary/20 border border-primary/40"
                  : "bg-muted border border-muted"
              }`}
              style={
                device.isOn
                  ? { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" }
                  : undefined
              }
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  device.isOn ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-base">{deviceName}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {aiMode ? t("devices.aiControlled") : t("devices.manualMode")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Power Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("devices.power")}</span>
            <Switch
              checked={device.isOn}
              onCheckedChange={onToggle}
              disabled={isDisabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Status Badge */}
          <div
            className={`text-center py-2 rounded-lg text-sm font-medium ${
              device.isOn
                ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {device.isOn ? t("devices.active") : t("devices.inactive")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeviceCard;
