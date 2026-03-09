import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Cpu, Wifi, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Activity,
      titleKey: "landing.features.analytics.title",
      descriptionKey: "landing.features.analytics.description",
      color: "primary",
    },
    {
      icon: Cpu,
      titleKey: "landing.features.climate.title",
      descriptionKey: "landing.features.climate.description",
      color: "neon-green",
    },
    {
      icon: Wifi,
      titleKey: "landing.features.remote.title",
      descriptionKey: "landing.features.remote.description",
      color: "neon-amber",
    },
    {
      icon: LayoutGrid,
      titleKey: "landing.features.multi.title",
      descriptionKey: "landing.features.multi.description",
      color: "accent",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">{t("landing.features.title")}</span>{" "}
            <span className="text-primary glow-text">{t("landing.features.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glow" className="h-full group hover:scale-[1.02] transition-transform">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border"
                    style={{
                      backgroundColor: `hsl(var(--${feature.color}) / 0.2)`,
                      borderColor: `hsl(var(--${feature.color}) / 0.4)`,
                    }}
                  >
                    <feature.icon
                      className="w-7 h-7"
                      style={{ color: `hsl(var(--${feature.color}))` }}
                    />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
