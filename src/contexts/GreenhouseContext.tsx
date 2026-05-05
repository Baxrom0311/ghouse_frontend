import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

import {
  apiFetch,
  BackendDevice,
  BackendGreenhouse,
  getStoredToken,
  getWebSocketUrl,
  isAbortError,
} from "@/lib/api";
import { useAuth } from "@/contexts/useAuth";
import { GreenhouseContext } from "@/contexts/greenhouse-context";

export interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "humidity" | "soil_moisture" | "co2" | "light";
  value: number | null;
  unit: string;
  min: number;
  max: number;
  status: "good" | "warning" | "critical" | "unknown";
}

export interface DeviceData {
  id: string;
  name: string;
  type: "soil_water_pump" | "air_water_pump" | "led" | "fan";
  isOn: boolean | null;
}

export interface GreenhouseSettings {
  name: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  soilMoistureMin: number;
  soilMoistureMax: number;
  co2Min: number;
  co2Max: number;
  lightMin: number;
  lightMax: number;
}

export interface Greenhouse {
  id: string;
  name: string;
  mqttTopicId: string | null;
  status: "ok" | "warning" | "critical" | "unknown";
  aiMode: boolean;
  sensors: SensorData[];
  devices: DeviceData[];
  settings: GreenhouseSettings;
}

interface BackendGreenhouseSnapshot {
  greenhouse: BackendGreenhouse;
  devices: BackendDevice[];
}

interface BackendGreenhouseStreamMessage {
  greenhouses: BackendGreenhouseSnapshot[];
}

const FALLBACK_POLL_INTERVAL_MS = 2000;
const WEBSOCKET_RECONNECT_INTERVAL_MS = 3000;
const ACTION_REFRESH_DELAYS_MS = [700, 1600, 3200];

const defaultSettings: GreenhouseSettings = {
  name: "",
  tempMin: 18,
  tempMax: 28,
  humidityMin: 40,
  humidityMax: 70,
  soilMoistureMin: 35,
  soilMoistureMax: 70,
  co2Min: 400,
  co2Max: 1200,
  lightMin: 20,
  lightMax: 60,
};

function getSensorStatus(
  value: number | null,
  min: number,
  max: number,
): "good" | "warning" | "critical" | "unknown" {
  if (value === null) {
    return "unknown";
  }
  if (value < min * 0.8 || value > max * 1.2) {
    return "critical";
  }
  if (value < min || value > max) {
    return "warning";
  }
  return "good";
}

function buildSensor(
  id: string,
  name: string,
  type: SensorData["type"],
  value: number | null | undefined,
  unit: string,
  min: number,
  max: number,
): SensorData {
  const numericValue =
    value === null || value === undefined ? null : Number(value);
  return {
    id,
    name,
    type,
    value: numericValue,
    unit,
    min,
    max,
    status: getSensorStatus(numericValue, min, max),
  };
}

function hasTelemetryData(greenhouse: BackendGreenhouse): boolean {
  return (
    greenhouse.stats.air !== null &&
      greenhouse.stats.air !== undefined ||
    greenhouse.stats.light !== null &&
      greenhouse.stats.light !== undefined ||
    greenhouse.stats.humidity !== null &&
      greenhouse.stats.humidity !== undefined ||
    greenhouse.stats.temperature !== null &&
      greenhouse.stats.temperature !== undefined ||
    greenhouse.stats.moisture !== null &&
      greenhouse.stats.moisture !== undefined ||
    greenhouse.stats.soil_water_pump !== null &&
      greenhouse.stats.soil_water_pump !== undefined ||
    greenhouse.stats.air_water_pump !== null &&
      greenhouse.stats.air_water_pump !== undefined ||
    greenhouse.stats.led !== null &&
      greenhouse.stats.led !== undefined ||
    greenhouse.stats.fan !== null &&
      greenhouse.stats.fan !== undefined
  );
}

function mapGreenhouse(
  greenhouse: BackendGreenhouse,
  devices: BackendDevice[],
): Greenhouse {
  const deviceMap = new Map(devices.map((device) => [device.name, device]));
  const hasTelemetry = hasTelemetryData(greenhouse);

  const settings: GreenhouseSettings = {
    name: greenhouse.name,
    tempMin: deviceMap.get("temperature")?.min_value ?? defaultSettings.tempMin,
    tempMax: deviceMap.get("temperature")?.max_value ?? defaultSettings.tempMax,
    humidityMin: deviceMap.get("humidity")?.min_value ?? defaultSettings.humidityMin,
    humidityMax: deviceMap.get("humidity")?.max_value ?? defaultSettings.humidityMax,
    soilMoistureMin:
      deviceMap.get("moisture")?.min_value ?? defaultSettings.soilMoistureMin,
    soilMoistureMax:
      deviceMap.get("moisture")?.max_value ?? defaultSettings.soilMoistureMax,
    co2Min: deviceMap.get("air")?.min_value ?? defaultSettings.co2Min,
    co2Max: deviceMap.get("air")?.max_value ?? defaultSettings.co2Max,
    lightMin: deviceMap.get("light")?.min_value ?? defaultSettings.lightMin,
    lightMax: deviceMap.get("light")?.max_value ?? defaultSettings.lightMax,
  };

  const sensors: SensorData[] = [
    buildSensor(
      "moisture",
      "Soil Moisture",
      "soil_moisture",
      greenhouse.stats.moisture,
      "%",
      settings.soilMoistureMin,
      settings.soilMoistureMax,
    ),
    buildSensor(
      "humidity",
      "Air Humidity",
      "humidity",
      greenhouse.stats.humidity,
      "%",
      settings.humidityMin,
      settings.humidityMax,
    ),
    buildSensor(
      "temperature",
      "Temperature",
      "temperature",
      greenhouse.stats.temperature,
      "°C",
      settings.tempMin,
      settings.tempMax,
    ),
    buildSensor(
      "air",
      "CO₂ Level",
      "co2",
      greenhouse.stats.air,
      "ppm",
      settings.co2Min,
      settings.co2Max,
    ),
    buildSensor(
      "light",
      "Light Intensity",
      "light",
      greenhouse.stats.light,
      "%",
      settings.lightMin,
      settings.lightMax,
    ),
  ];

  const devicesState: DeviceData[] = [
    {
      id: "soil_water_pump",
      name: "Soil Water Pump",
      type: "soil_water_pump",
      isOn:
        greenhouse.stats.soil_water_pump === null ||
        greenhouse.stats.soil_water_pump === undefined
          ? null
          : greenhouse.stats.soil_water_pump,
    },
    {
      id: "air_water_pump",
      name: "Air Water Pump",
      type: "air_water_pump",
      isOn:
        greenhouse.stats.air_water_pump === null ||
        greenhouse.stats.air_water_pump === undefined
          ? null
          : greenhouse.stats.air_water_pump,
    },
    {
      id: "led",
      name: "LED Grow Light",
      type: "led",
      isOn:
        greenhouse.stats.led === null || greenhouse.stats.led === undefined
          ? null
          : greenhouse.stats.led,
    },
    {
      id: "fan",
      name: "Ventilation Fan",
      type: "fan",
      isOn:
        greenhouse.stats.fan === null || greenhouse.stats.fan === undefined
          ? null
          : greenhouse.stats.fan,
    },
  ];

  const knownSensors = sensors.filter((sensor) => sensor.status !== "unknown");
  const status =
    !hasTelemetry || knownSensors.length === 0
      ? "unknown"
      : knownSensors.some((sensor) => sensor.status === "critical")
        ? "critical"
        : knownSensors.some((sensor) => sensor.status === "warning")
          ? "warning"
          : "ok";

  return {
    id: String(greenhouse.id),
    name: greenhouse.name,
    mqttTopicId: greenhouse.mqtt_topic_id ?? null,
    status,
    aiMode: Boolean(greenhouse.ai_mode),
    sensors,
    devices: devicesState,
    settings,
  };
}

export const GreenhouseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const refreshInFlightRef = useRef(false);
  const actionRefreshTimeoutsRef = useRef<number[]>([]);

  const applySnapshots = useCallback((snapshots: BackendGreenhouseSnapshot[]) => {
    setGreenhouses(
      snapshots.map((snapshot) =>
        mapGreenhouse(snapshot.greenhouse, snapshot.devices),
      ),
    );
  }, []);

  const refreshGreenhouses = useCallback(async (signal?: AbortSignal) => {
    if (!isAuthenticated) {
      setGreenhouses([]);
      setErrorMessage(null);
      return;
    }

    if (refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;
    setLoading(true);
    try {
      const greenhouseList = await apiFetch<BackendGreenhouse[]>("/greenhouses", {
        signal,
      });
      const hydratedGreenhouses = await Promise.all(
        greenhouseList.map(async (greenhouse) => {
          const devices = await apiFetch<BackendDevice[]>(
            `/greenhouses/${greenhouse.id}/devices`,
            { signal },
          );
          return mapGreenhouse(greenhouse, devices);
        }),
      );

      setGreenhouses(hydratedGreenhouses);
      setErrorMessage(null);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      const message =
        error instanceof Error ? error.message : "Failed to refresh greenhouses";
      setErrorMessage(message);
      throw error;
    } finally {
      refreshInFlightRef.current = false;
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  const scheduleActionRefreshes = useCallback(() => {
    actionRefreshTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    actionRefreshTimeoutsRef.current = ACTION_REFRESH_DELAYS_MS.map((delay) =>
      window.setTimeout(() => {
        void refreshGreenhouses().catch(() => undefined);
      }, delay),
    );
  }, [refreshGreenhouses]);

  useEffect(() => {
    return () => {
      actionRefreshTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      actionRefreshTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    void refreshGreenhouses(abortController.signal).catch(() => undefined);
    return () => {
      abortController.abort();
    };
  }, [refreshGreenhouses]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const token = getStoredToken();
    if (!token) {
      return;
    }

    let closedByEffect = false;
    let fallbackIntervalId: number | undefined;
    let reconnectTimeoutId: number | undefined;
    let socket: WebSocket | undefined;

    const startFallbackPolling = () => {
      if (fallbackIntervalId !== undefined) {
        return;
      }
      fallbackIntervalId = window.setInterval(() => {
        void refreshGreenhouses();
      }, FALLBACK_POLL_INTERVAL_MS);
    };

    const stopFallbackPolling = () => {
      if (fallbackIntervalId === undefined) {
        return;
      }
      window.clearInterval(fallbackIntervalId);
      fallbackIntervalId = undefined;
    };

    const connect = () => {
      socket = new WebSocket(getWebSocketUrl("/greenhouses/ws"), [
        "agroai.auth",
        token,
      ]);

      socket.onopen = () => {
        stopFallbackPolling();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as BackendGreenhouseStreamMessage;
          applySnapshots(data.greenhouses);
          setErrorMessage(null);
        } catch {
          void refreshGreenhouses().catch(() => undefined);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        if (closedByEffect) {
          return;
        }
        startFallbackPolling();
        reconnectTimeoutId = window.setTimeout(connect, WEBSOCKET_RECONNECT_INTERVAL_MS);
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      socket?.close();
      stopFallbackPolling();
      if (reconnectTimeoutId !== undefined) {
        window.clearTimeout(reconnectTimeoutId);
      }
    };
  }, [applySnapshots, isAuthenticated, refreshGreenhouses]);

  const addGreenhouse = async (name: string) => {
    await apiFetch("/greenhouses", {
      method: "POST",
      body: JSON.stringify({ name, ai_mode: true }),
    });
    await refreshGreenhouses();
  };

  const updateGreenhouseSettings = async (
    id: string,
    settings: GreenhouseSettings,
  ) => {
    await apiFetch(`/greenhouses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: settings.name }),
    });

    await apiFetch(`/greenhouses/${id}/devices/settings`, {
      method: "POST",
      body: JSON.stringify({
        temperature: { min: settings.tempMin, max: settings.tempMax },
        humidity: { min: settings.humidityMin, max: settings.humidityMax },
        moisture: {
          min: settings.soilMoistureMin,
          max: settings.soilMoistureMax,
        },
        air: { min: settings.co2Min, max: settings.co2Max },
        light: { min: settings.lightMin, max: settings.lightMax },
      }),
    });

    await refreshGreenhouses();
  };

  const toggleAiMode = async (id: string) => {
    const greenhouse = greenhouses.find((item) => item.id === id);
    if (!greenhouse) {
      throw new Error("Greenhouse not found");
    }

    const nextState = greenhouse.aiMode ? "off" : "on";
    await apiFetch(`/greenhouses/${id}/ai/switch/${nextState}`, {
      method: "POST",
    });
    setGreenhouses((current) =>
      current.map((item) =>
        item.id === id ? { ...item, aiMode: nextState === "on" } : item,
      ),
    );
    scheduleActionRefreshes();
  };

  const toggleDevice = async (
    greenhouseId: string,
    deviceName: DeviceData["type"],
  ) => {
    const greenhouse = greenhouses.find((item) => item.id === greenhouseId);
    const device = greenhouse?.devices.find((item) => item.type === deviceName);
    if (!greenhouse || !device) {
      throw new Error("Device not found");
    }

    const nextState = device.isOn ? "off" : "on";
    await apiFetch(
      `/greenhouses/${greenhouseId}/devices/${deviceName}/switch/${nextState}`,
      {
        method: "POST",
      },
    );
    setGreenhouses((current) =>
      current.map((item) =>
        item.id === greenhouseId
          ? {
              ...item,
              devices: item.devices.map((currentDevice) =>
                currentDevice.type === deviceName
                  ? { ...currentDevice, isOn: nextState === "on" }
                  : currentDevice,
              ),
            }
          : item,
      ),
    );
    scheduleActionRefreshes();
  };

  return (
    <GreenhouseContext.Provider
      value={{
      greenhouses,
      loading,
      errorMessage,
      refreshGreenhouses,
        addGreenhouse,
        updateGreenhouseSettings,
        toggleAiMode,
        toggleDevice,
      }}
    >
      {children}
    </GreenhouseContext.Provider>
  );
};
