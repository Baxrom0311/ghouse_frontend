import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Brain, Hand } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AiModeToggleProps {
  aiMode: boolean;
  onToggle: () => void;
}

const AiModeToggle: React.FC<AiModeToggleProps> = ({ aiMode, onToggle }) => {
  const { t } = useTranslation();

  return (
    <Card variant="glow" className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              boxShadow: aiMode
                ? [
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 40px hsl(var(--primary) / 0.5)",
                    "0 0 20px hsl(var(--primary) / 0.3)",
                  ]
                : "none",
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${
              aiMode
                ? "bg-primary/20 border-2 border-primary/60"
                : "bg-muted border-2 border-muted"
            }`}
          >
            {aiMode ? (
              <Brain className="w-7 h-7 text-primary" />
            ) : (
              <Hand className="w-7 h-7 text-muted-foreground" />
            )}
          </motion.div>

          <div>
            <h3 className="font-display text-lg font-semibold">
              {aiMode ? t("aiMode.aiMode") : t("aiMode.manualMode")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {aiMode ? t("aiMode.aiDescription") : t("aiMode.manualDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm ${!aiMode ? "text-primary" : "text-muted-foreground"}`}>
            {t("aiMode.manual")}
          </span>
          <Switch
            checked={aiMode}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-primary scale-125"
          />
          <span className={`text-sm ${aiMode ? "text-primary glow-text" : "text-muted-foreground"}`}>
            {t("aiMode.ai")}
          </span>
        </div>
      </div>

      {aiMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-primary/20"
        >
          <div className="flex items-center gap-2 text-sm text-primary">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            <span>{t("aiMode.optimizing")}</span>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default AiModeToggle;
