import React from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, Leaf, Zap } from "lucide-react";

const stats = [
  { icon: Leaf, value: "5+", label: "Sensor turlari", color: "primary" },
  { icon: Activity, value: "24/7", label: "Real-time monitoring", color: "neon-green" },
  { icon: Cpu, value: "AI", label: "Avtomatik boshqaruv", color: "neon-amber" },
  { icon: Zap, value: "2s", label: "Yangilanish tezligi", color: "accent" },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-16 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `hsl(var(--${stat.color}) / 0.12)` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: `hsl(var(--${stat.color}))` }} />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
