import { useContext } from "react";

import { GreenhouseContext } from "@/contexts/greenhouse-context";

export const useGreenhouse = () => {
  const context = useContext(GreenhouseContext);
  if (context === undefined) {
    throw new Error("useGreenhouse must be used within a GreenhouseProvider");
  }
  return context;
};
