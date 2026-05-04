import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreenhouse } from "@/contexts/useGreenhouse";
import Navbar from "@/components/layout/Navbar";
import GreenhouseSubnav from "@/components/greenhouse/GreenhouseSubnav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Thermometer, Droplets, Wind, Cloud, Check, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const GreenhouseSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { greenhouses, loading, updateGreenhouseSettings } = useGreenhouse();
  const { t } = useTranslation();
  const greenhouse = greenhouses.find((g) => g.id === id);

  const [settings, setSettings] = useState(greenhouse?.settings || {
    name: "", tempMin: 18, tempMax: 28, humidityMin: 50, humidityMax: 70,
    soilMoistureMin: 40, soilMoistureMax: 80, co2Min: 300, co2Max: 800, lightMin: 20, lightMax: 60,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (greenhouse) {
      setSettings(greenhouse.settings);
    }
  }, [greenhouse]);

  if (!greenhouse && loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="rounded-lg border border-primary/20 bg-card/40 p-6 text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        </main>
      </div>
    );
  }

  if (!greenhouse) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">{t("greenhouse.notFound")}</h1>
            <Link to="/dashboard"><Button variant="neon">{t("greenhouse.backToDashboard")}</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  const thresholdPairs = [
    [settings.tempMin, settings.tempMax],
    [settings.humidityMin, settings.humidityMax],
    [settings.soilMoistureMin, settings.soilMoistureMax],
    [settings.co2Min, settings.co2Max],
    [settings.lightMin, settings.lightMax],
  ];
  const hasInvalidThreshold = thresholdPairs.some(([min, max]) => max <= min);
  const canSave = settings.name.trim().length > 0 && !hasInvalidThreshold && !isSaving;

  const handleSave = async () => {
    if (!settings.name.trim()) {
      toast.error(t("settings.nameRequired"));
      return;
    }
    if (hasInvalidThreshold) {
      toast.error(t("settings.invalidThresholds"));
      return;
    }

    setIsSaving(true);
    try {
      await updateGreenhouseSettings(greenhouse.id, {
        ...settings,
        name: settings.name.trim(),
      });
      toast.success(t("settings.settingsSavedMsg"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("settings.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const saveButtonContent = isSaving ? (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent"
    />
  ) : saved ? (
    <>
      <Check className="w-5 h-5 mr-2" />
      {t("settings.settingsSaved")}
    </>
  ) : (
    <>
      <Save className="w-5 h-5 mr-2" />
      {t("settings.saveSettings")}
    </>
  );

  const thresholdGroups = [
    { title: t("sensors.temperature"), icon: Thermometer, color: "neon-coral", minKey: "tempMin" as const, maxKey: "tempMax" as const, unit: "°C" },
    { title: t("sensors.airHumidity"), icon: Cloud, color: "neon-cyan", minKey: "humidityMin" as const, maxKey: "humidityMax" as const, unit: "%" },
    { title: t("sensors.soilMoisture"), icon: Droplets, color: "neon-green", minKey: "soilMoistureMin" as const, maxKey: "soilMoistureMax" as const, unit: "%" },
    { title: t("sensors.co2Level"), icon: Wind, color: "neon-amber", minKey: "co2Min" as const, maxKey: "co2Max" as const, unit: "ppm" },
    { title: t("sensors.lightIntensity"), icon: Sun, color: "accent", minKey: "lightMin" as const, maxKey: "lightMax" as const, unit: "%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
          <GreenhouseSubnav
            greenhouseId={greenhouse.id}
            greenhouseName={greenhouse.name}
            subtitle={t("settings.subtitle")}
          />

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-6">
              <Card variant="glass">
              <CardHeader><CardTitle>{t("settings.general")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.greenhouseName")}</Label>
                  <Input id="name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="mqtt-topic">{t("settings.mqttTopic")}</Label>
                    <Input
                      id="mqtt-topic"
                      value={greenhouse.mqttTopicId ?? t("settings.autoTopic")}
                      readOnly
                      className="text-muted-foreground"
                    />
                  </div>
              </CardContent>
            </Card>

              <Card variant="glass">
                <CardHeader><CardTitle>{t("settings.saveTitle")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("settings.saveHint")}</p>
                  {hasInvalidThreshold && (
                    <p className="text-sm text-destructive">
                      {t("settings.invalidThresholds")}
                    </p>
                  )}
                  <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={!canSave}>
                    {saveButtonContent}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card variant="glass">
              <CardHeader><CardTitle>{t("settings.sensorThresholds")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {thresholdGroups.map((group) => (
                    <div key={group.title} className="p-4 rounded-lg bg-muted/30 border border-primary/10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(var(--${group.color}) / 0.2)` }}>
                          <group.icon className="w-4 h-4" style={{ color: `hsl(var(--${group.color}))` }} />
                        </div>
                        <span className="font-medium">{group.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t("sensors.min")} ({group.unit})</Label>
                          <Input type="number" value={settings[group.minKey]} onChange={(e) => setSettings({ ...settings, [group.minKey]: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t("sensors.max")} ({group.unit})</Label>
                          <Input type="number" value={settings[group.maxKey]} onChange={(e) => setSettings({ ...settings, [group.maxKey]: Number(e.target.value) })} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="sticky bottom-4 z-10 mt-6 rounded-lg border border-primary/20 bg-background/90 p-3 backdrop-blur lg:hidden">
            <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={!canSave}>
              {saveButtonContent}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GreenhouseSettingsPage;
