import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Hand } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AiModeToggleProps {
  aiMode: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const AiModeToggle: React.FC<AiModeToggleProps> = ({
  aiMode,
  disabled = false,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="default" className="p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={aiMode ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              aiMode
                ? "bg-primary/15 border border-primary/40"
                : "bg-muted border border-border"
            }`}
          >
            {aiMode ? (
              <Brain className="w-6 h-6 text-primary" />
            ) : (
              <Hand className="w-6 h-6 text-muted-foreground" />
            )}
          </motion.div>
          <div>
            <h3 className="font-display text-base font-semibold">
              {aiMode ? t("aiMode.aiMode") : t("aiMode.manualMode")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {aiMode ? t("aiMode.aiDescription") : t("aiMode.manualDescription")}
            </p>
          </div>
        </div>

        {/* Segmented control */}
        <div className="relative flex rounded-xl bg-muted p-1 border border-border">
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-primary"
            animate={{ left: aiMode ? "50%" : "4px", right: aiMode ? "4px" : "50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <button
            type="button"
            onClick={() => aiMode && onToggle()}
            disabled={disabled}
            className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              !aiMode ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Hand className="w-4 h-4" />
            {t("aiMode.manual")}
          </button>
          <button
            type="button"
            onClick={() => !aiMode && onToggle()}
            disabled={disabled}
            className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              aiMode ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Brain className="w-4 h-4" />
            {t("aiMode.ai")}
          </button>
        </div>
      </div>

      {aiMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-3 border-t border-border"
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

export default React.memo(AiModeToggle);
