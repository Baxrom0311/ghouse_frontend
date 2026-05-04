import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreenhouse } from "@/contexts/useGreenhouse";
import Navbar from "@/components/layout/Navbar";
import GreenhouseSubnav from "@/components/greenhouse/GreenhouseSubnav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useTranslation } from "react-i18next";
import { apiFetch, BackendTelemetry, isAbortError } from "@/lib/api";
import { toast } from "sonner";

const sensorColors: Record<string, string> = { temperature: "#ff6b6b", humidity: "#00f0ff", soil_moisture: "#00ff88", co2: "#ffaa00", light: "#bb88ff" };
const sensorNameKeys: Record<string, string> = { soil_moisture: "sensors.soilMoisture", humidity: "sensors.airHumidity", temperature: "sensors.temperature", co2: "sensors.co2Level", light: "sensors.lightIntensity" };

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { greenhouses, loading } = useGreenhouse();
  const { t } = useTranslation();
  const [selectedSensorId, setSelectedSensorId] = useState(
    searchParams.get("sensor") || "temperature",
  );
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [history, setHistory] = useState<BackendTelemetry[]>([]);

  const greenhouse = greenhouses.find((g) => g.id === id);
  const selectedSensor = greenhouse?.sensors.find((s) => s.id === selectedSensorId);

  useEffect(() => {
    if (!greenhouse) return;
    const hasSelectedSensor = greenhouse.sensors.some(
      (sensor) => sensor.id === selectedSensorId,
    );
    if (!hasSelectedSensor && greenhouse.sensors[0]) {
      setSelectedSensorId(greenhouse.sensors[0].id);
    }
  }, [greenhouse, selectedSensorId]);

  useEffect(() => {
    if (!id) return;

    const abortController = new AbortController();
    const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 24 * 7 : 24 * 30;
    void apiFetch<BackendTelemetry[]>(
      `/greenhouses/${id}/telemetry?hours=${hours}&limit=500`,
      { signal: abortController.signal },
    )
      .then(setHistory)
      .catch((error) => {
        if (isAbortError(error)) {
          return;
        }
        toast.error(error instanceof Error ? error.message : "Telemetry load failed");
      });

    return () => {
      abortController.abort();
    };
  }, [id, timeRange]);

  const chartData = useMemo(() => {
    if (!selectedSensor) return [];
    return history
      .map((point) => {
        const value =
          selectedSensor.type === "temperature"
            ? point.temperature
            : selectedSensor.type === "humidity"
              ? point.humidity
              : selectedSensor.type === "soil_moisture"
                ? point.moisture
                : selectedSensor.type === "co2"
                  ? point.air
                  : point.light;
        if (value === null || value === undefined) {
          return null;
        }
        return {
          time: new Date(point.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          value,
        };
      })
      .filter((point): point is { time: string; value: number } => point !== null);
  }, [history, selectedSensor]);

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

  const sensorColor = selectedSensor ? sensorColors[selectedSensor.type] : "#00f0ff";
  const sensorName = selectedSensor ? t(sensorNameKeys[selectedSensor.type]) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GreenhouseSubnav
            greenhouseId={greenhouse.id}
            greenhouseName={greenhouse.name}
            subtitle={t("analytics.subtitle")}
          />

          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/20 bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-3 sm:grid-cols-[220px_auto]">
              <Select value={selectedSensorId} onValueChange={setSelectedSensorId}>
                <SelectTrigger><SelectValue placeholder={t("analytics.selectSensor")} /></SelectTrigger>
                <SelectContent>{greenhouse.sensors.map((sensor) => <SelectItem key={sensor.id} value={sensor.id}>{t(sensorNameKeys[sensor.type])}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex rounded-lg border border-primary/30 overflow-hidden">
                {(["24h", "7d", "30d"] as const).map((range) => <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === range ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>{range}</button>)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{sensorName}</div>
          </div>

          {selectedSensor && (
            <Card variant="glow" className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-muted-foreground text-sm">{t("analytics.current")} {sensorName}</p><p className="font-display text-4xl font-bold" style={{ color: sensorColor, textShadow: `0 0 20px ${sensorColor}50` }}>{selectedSensor.value === null ? t("greenhouse.noData") : `${selectedSensor.value.toFixed(1)} ${selectedSensor.unit}`}</p></div>
                  <div className="text-right"><p className="text-muted-foreground text-sm">{t("analytics.range")}</p><p className="text-foreground">{selectedSensor.min} - {selectedSensor.max} {selectedSensor.unit}</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card variant="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />{sensorName} {t("analytics.overTime")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={sensorColor} stopOpacity={0.3} /><stop offset="95%" stopColor={sensorColor} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: `1px solid ${sensorColor}40`, borderRadius: "8px" }} formatter={(value: number) => [`${value.toFixed(1)} ${selectedSensor?.unit}`, sensorName]} />
                    <Area type="monotone" dataKey="value" stroke={sensorColor} strokeWidth={2} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="font-display text-lg font-semibold mb-4">{t("analytics.quickAccess")}</h3>
            <div className="flex flex-wrap gap-2">{greenhouse.sensors.map((sensor) => <Button key={sensor.id} variant={selectedSensorId === sensor.id ? "neon" : "outline"} size="sm" onClick={() => setSelectedSensorId(sensor.id)}>{t(sensorNameKeys[sensor.type])}</Button>)}</div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
