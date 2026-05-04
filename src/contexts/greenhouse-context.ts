import { createContext } from "react";

import type {
  DeviceData,
  Greenhouse,
  GreenhouseSettings,
} from "@/contexts/GreenhouseContext";

export interface GreenhouseContextType {
  greenhouses: Greenhouse[];
  loading: boolean;
  errorMessage: string | null;
  refreshGreenhouses: () => Promise<void>;
  addGreenhouse: (name: string) => Promise<void>;
  updateGreenhouseSettings: (
    id: string,
    settings: GreenhouseSettings,
  ) => Promise<void>;
  toggleAiMode: (id: string) => Promise<void>;
  toggleDevice: (greenhouseId: string, deviceName: DeviceData["type"]) => Promise<void>;
}

export const GreenhouseContext = createContext<GreenhouseContextType | undefined>(undefined);
