import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreenhouse } from "@/contexts/GreenhouseContext";
import Navbar from "@/components/layout/Navbar";
import AiModeToggle from "@/components/greenhouse/AiModeToggle";
import SensorCard from "@/components/greenhouse/SensorCard";
import DeviceCard from "@/components/greenhouse/DeviceCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, LineChart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const GreenhouseViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { greenhouses, toggleAiMode, toggleDevice } = useGreenhouse();
  const { t } = useTranslation();
  const [isAiTogglePending, setIsAiTogglePending] = useState(false);
  const [pendingDevices, setPendingDevices] = useState<Record<string, boolean>>({});

  const greenhouse = greenhouses.find((g) => g.id === id);

  const handleToggleAiMode = async () => {
    if (!greenhouse || isAiTogglePending) return;
    setIsAiTogglePending(true);
    try {
      await toggleAiMode(greenhouse.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.loginError"));
    } finally {
      setIsAiTogglePending(false);
    }
  };

  const handleToggleDevice = async (
    deviceName: "soil_water_pump" | "air_water_pump" | "led" | "fan",
  ) => {
    if (!greenhouse || pendingDevices[deviceName]) return;
    setPendingDevices((current) => ({ ...current, [deviceName]: true }));
    try {
      await toggleDevice(greenhouse.id, deviceName);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.loginError"));
    } finally {
      setPendingDevices((current) => {
        const next = { ...current };
        delete next[deviceName];
        return next;
      });
    }
  };

  if (!greenhouse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">{t("greenhouse.notFound")}</h1>
          <Link to="/dashboard">
            <Button variant="neon">{t("greenhouse.backToDashboard")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  <span className="text-foreground">{greenhouse.name}</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("greenhouse.realTimeMonitoring")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/greenhouse/${id}/analytics`}>
                <Button variant="outline">
                  <LineChart className="w-4 h-4 mr-2" />
                  {t("greenhouse.analytics")}
                </Button>
              </Link>
              <Link to={`/greenhouse/${id}/settings`}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  {t("greenhouse.settings")}
                </Button>
              </Link>
            </div>
          </div>

          {/* AI Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <AiModeToggle
              aiMode={greenhouse.aiMode}
              disabled={isAiTogglePending}
              onToggle={handleToggleAiMode}
            />
          </motion.div>

          {/* Sensors Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
              {t("greenhouse.sensors")}
              <span className="text-xs text-muted-foreground font-normal ml-2">
                {t("greenhouse.liveData")}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {greenhouse.sensors.map((sensor, index) => (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <SensorCard sensor={sensor} greenhouseId={greenhouse.id} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Devices Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green" />
              {t("greenhouse.devices")}
              {greenhouse.aiMode && (
                <span className="text-xs text-primary font-normal ml-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
                  {t("greenhouse.aiControlled")}
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {greenhouse.devices.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <DeviceCard
                    device={device}
                    aiMode={greenhouse.aiMode}
                    pending={Boolean(pendingDevices[device.type])}
                    onToggle={() => handleToggleDevice(device.type)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default GreenhouseViewPage;
