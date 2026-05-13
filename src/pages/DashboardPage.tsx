import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGreenhouse } from "@/contexts/useGreenhouse";
import Navbar from "@/components/layout/Navbar";
import GreenhouseCard from "@/components/greenhouse/GreenhouseCard";
import { Plus, Leaf, Activity, Bot, Thermometer, Droplets } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DashboardPage: React.FC = () => {
  const { greenhouses, addGreenhouse, loading, errorMessage } = useGreenhouse();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGreenhouseName, setNewGreenhouseName] = useState("");
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const total = greenhouses.length;
    const aiActive = greenhouses.filter((g) => g.aiMode).length;
    const sensorsOnline = greenhouses.reduce(
      (acc, g) => acc + g.sensors.filter((s) => s.value !== null).length, 0
    );
    const criticalCount = greenhouses.reduce(
      (acc, g) => acc + g.sensors.filter((s) => s.status === "critical").length, 0
    );
    return { total, aiActive, sensorsOnline, criticalCount };
  }, [greenhouses]);

  const handleAddGreenhouse = async () => {
    if (!newGreenhouseName.trim()) {
      toast.error(t("dashboard.nameRequired"));
      return;
    }

    try {
      await addGreenhouse(newGreenhouseName);
      toast.success(`${newGreenhouseName} ${t("dashboard.created")}`);
      setNewGreenhouseName("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.registerError"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                <span className="text-foreground">{t("dashboard.title")}</span>{" "}
                <span className="text-primary glow-text">{t("dashboard.titleHighlight")}</span>
              </h1>
              <p className="text-muted-foreground">
                {t("dashboard.subtitle")}
              </p>
            </div>
            <Button
              variant="neon"
              className="mt-4 md:mt-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("dashboard.addGreenhouse")}
            </Button>
          </div>

          {greenhouses.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Card variant="default" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Issiqxonalar</p>
                  </div>
                </div>
              </Card>
              <Card variant="default" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neon-green/15 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stats.sensorsOnline}</p>
                    <p className="text-xs text-muted-foreground">Faol sensorlar</p>
                  </div>
                </div>
              </Card>
              <Card variant="default" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stats.aiActive}</p>
                    <p className="text-xs text-muted-foreground">AI rejimda</p>
                  </div>
                </div>
              </Card>
              <Card variant="default" className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stats.criticalCount > 0 ? "bg-neon-coral/15" : "bg-muted"}`}>
                    <Thermometer className={`w-5 h-5 ${stats.criticalCount > 0 ? "text-neon-coral" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stats.criticalCount}</p>
                    <p className="text-xs text-muted-foreground">Ogohlantirishlar</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {loading && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-card/40 p-6 text-sm text-muted-foreground">
              {t("common.loading")}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && greenhouses.length === 0 && (
              <Card variant="glass" className="col-span-full">
                <CardContent className="py-10 text-center">
                  <Leaf className="mx-auto mb-4 h-10 w-10 text-primary" />
                  <h2 className="mb-2 font-display text-xl font-semibold">
                    {t("dashboard.emptyTitle")}
                  </h2>
                  <p className="mx-auto mb-5 max-w-md text-sm text-muted-foreground">
                    {t("dashboard.emptyDescription")}
                  </p>
                  <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    {t("dashboard.addGreenhouse")}
                  </Button>
                </CardContent>
              </Card>
            )}
            {greenhouses.map((greenhouse, index) => (
              <motion.div
                key={greenhouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GreenhouseCard greenhouse={greenhouse} />
              </motion.div>
            ))}

            {greenhouses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: greenhouses.length * 0.1 }}
              >
              <Card
                variant="default"
                className="h-full min-h-[260px] flex items-center justify-center cursor-pointer hover:border-primary/40 group"
                onClick={() => setIsDialogOpen(true)}
              >
                <CardContent className="text-center">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-dashed border-primary/40 group-hover:border-primary/60">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-muted-foreground group-hover:text-foreground">
                    {t("dashboard.addNew")}
                  </h3>
                </CardContent>
              </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                {t("dashboard.newGreenhouse")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder={t("dashboard.namePlaceholder")}
                value={newGreenhouseName}
                onChange={(e) => setNewGreenhouseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGreenhouse()}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  {t("dashboard.cancel")}
                </Button>
                <Button variant="neon" onClick={handleAddGreenhouse}>
                  {t("dashboard.create")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DashboardPage;
