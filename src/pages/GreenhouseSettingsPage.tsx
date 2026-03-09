import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreenhouse } from "@/contexts/GreenhouseContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Thermometer, Droplets, Wind, Cloud, Check, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const GreenhouseSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { greenhouses, updateGreenhouseSettings } = useGreenhouse();
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

  if (!greenhouse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">{t("greenhouse.notFound")}</h1>
          <Link to="/dashboard"><Button variant="neon">{t("greenhouse.backToDashboard")}</Button></Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGreenhouseSettings(greenhouse.id, settings);
      toast.success(t("settings.settingsSavedMsg"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.loginError"));
    } finally {
      setIsSaving(false);
    }
  };

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to={`/greenhouse/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="text-foreground">{t("settings.title")}</span>{" "}
                <span className="text-primary glow-text">{t("settings.titleHighlight")}</span>
              </h1>
              <p className="text-muted-foreground text-sm">{t("settings.subtitle")}</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader><CardTitle>{t("settings.general")}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.greenhouseName")}</Label>
                  <Input id="name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader><CardTitle>{t("settings.sensorThresholds")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {thresholdGroups.map((group) => (
                    <div key={group.title} className="p-4 rounded-xl bg-muted/30 border border-primary/10">
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

            <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                : saved ? <><Check className="w-5 h-5 mr-2" />{t("settings.settingsSaved")}</> : <><Save className="w-5 h-5 mr-2" />{t("settings.saveSettings")}</>}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GreenhouseSettingsPage;
