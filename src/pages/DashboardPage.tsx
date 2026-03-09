import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGreenhouse } from "@/contexts/GreenhouseContext";
import Navbar from "@/components/layout/Navbar";
import GreenhouseCard from "@/components/greenhouse/GreenhouseCard";
import { Plus, Leaf } from "lucide-react";
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
  const { greenhouses, addGreenhouse, loading } = useGreenhouse();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGreenhouseName, setNewGreenhouseName] = useState("");
  const { t } = useTranslation();

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
          {/* Header */}
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

          {/* Greenhouse Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && greenhouses.length === 0 && (
              <Card variant="glass" className="col-span-full">
                <CardContent className="py-10 text-center text-muted-foreground">
                  {t("dashboard.subtitle")}
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

            {/* Add New Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: greenhouses.length * 0.1 }}
            >
              <Card
                variant="glow"
                className="h-full min-h-[280px] flex items-center justify-center cursor-pointer hover:border-primary/60 group"
                onClick={() => setIsDialogOpen(true)}
              >
                <CardContent className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-primary/40 group-hover:border-primary/60"
                  >
                    <Plus className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold text-muted-foreground group-hover:text-foreground">
                    {t("dashboard.addNew")}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Add Greenhouse Dialog */}
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
