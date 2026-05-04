import { useCallback, useEffect, useMemo, useState } from "react";
import { Leaf, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, isAbortError } from "@/lib/api";

interface Plant {
  id: number;
  greenhouse_id: number;
  name?: string | null;
  type: string;
  variety?: string | null;
}

interface PlantPanelProps {
  greenhouseId: string;
}

function plantLabel(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const PlantPanel: React.FC<PlantPanelProps> = ({ greenhouseId }) => {
  const { t } = useTranslation();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedTypeLabel = useMemo(
    () => (selectedType ? plantLabel(selectedType) : ""),
    [selectedType],
  );

  const loadPlants = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [types, existingPlants] = await Promise.all([
        apiFetch<string[]>(`/greenhouses/${greenhouseId}/plants/plant-types`, {
          signal,
        }),
        apiFetch<Plant[]>(`/greenhouses/${greenhouseId}/plants`, { signal }),
      ]);
      setPlantTypes(types);
      setPlants(existingPlants);
      setSelectedType((current) => current || types[0] || "");
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      toast.error(error instanceof Error ? error.message : t("plants.loadError"));
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [greenhouseId, t]);

  useEffect(() => {
    const abortController = new AbortController();
    void loadPlants(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [loadPlants]);

  const addPlant = async () => {
    if (!selectedType || saving) {
      return;
    }

    setSaving(true);
    try {
      const plant = await apiFetch<Plant>(`/greenhouses/${greenhouseId}/plants`, {
        method: "POST",
        body: JSON.stringify({
          type: selectedType,
          name: name.trim() || selectedTypeLabel,
          variety: variety.trim() || null,
        }),
      });
      setPlants((current) => [...current, plant]);
      setName("");
      setVariety("");
      toast.success(t("plants.added"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("plants.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const deletePlant = async (plantId: number) => {
    try {
      await apiFetch(`/greenhouses/${greenhouseId}/plants/${plantId}`, {
        method: "DELETE",
      });
      setPlants((current) => current.filter((plant) => plant.id !== plantId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("plants.saveError"));
    }
  };

  return (
    <Card variant="glass">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Leaf className="h-5 w-5 text-primary" />
            {t("plants.title")}
          </CardTitle>
          <Badge variant="outline" className="w-fit border-primary/30 text-primary">
            {plants.length} {t("plants.count")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
          <div className="space-y-2">
            <Label>{t("plants.type")}</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder={t("plants.selectType")} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {plantTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {plantLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plant-name">{t("plants.name")}</Label>
            <Input
              id="plant-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={selectedTypeLabel || t("plants.name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plant-variety">{t("plants.variety")}</Label>
            <Input
              id="plant-variety"
              value={variety}
              onChange={(event) => setVariety(event.target.value)}
              placeholder={t("plants.optional")}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={addPlant} disabled={saving || !selectedType}>
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("plants.add")}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-primary/10">
          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </div>
          ) : plants.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              {t("plants.empty")}
            </div>
          ) : (
            <div className="divide-y divide-primary/10">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {plant.name || plantLabel(plant.type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plantLabel(plant.type)}
                      {plant.variety ? ` / ${plant.variety}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => void deletePlant(plant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("common.delete")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantPanel;
