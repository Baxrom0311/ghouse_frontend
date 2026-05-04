import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Bot, Gauge, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGreenhouse } from "@/contexts/useGreenhouse";
import { cn } from "@/lib/utils";

interface GreenhouseSubnavProps {
  greenhouseId: string;
  greenhouseName: string;
  subtitle?: string;
}

const GreenhouseSubnav: React.FC<GreenhouseSubnavProps> = ({
  greenhouseId,
  greenhouseName,
  subtitle,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { greenhouses } = useGreenhouse();
  const { t } = useTranslation();

  const currentSection = pathname.endsWith("/assistant")
    ? "assistant"
    : pathname.endsWith("/analytics")
      ? "analytics"
      : pathname.endsWith("/settings")
        ? "settings"
        : "";

  const handleGreenhouseChange = (nextGreenhouseId: string) => {
    const suffix = currentSection ? `/${currentSection}` : "";
    navigate(`/greenhouse/${nextGreenhouseId}${suffix}`);
  };

  const tabs = [
    {
      to: `/greenhouse/${greenhouseId}`,
      label: t("greenhouse.overview"),
      icon: Gauge,
      exact: true,
    },
    {
      to: `/greenhouse/${greenhouseId}/assistant`,
      label: t("greenhouse.aiChat"),
      icon: Bot,
    },
    {
      to: `/greenhouse/${greenhouseId}/analytics`,
      label: t("greenhouse.analytics"),
      icon: BarChart3,
    },
    {
      to: `/greenhouse/${greenhouseId}/settings`,
      label: t("greenhouse.settings"),
      icon: Settings,
    },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" aria-label={t("greenhouse.backToDashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold md:text-3xl">
              {greenhouseName}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {greenhouses.length > 1 && (
          <div className="w-full md:w-72">
            <Select value={greenhouseId} onValueChange={handleGreenhouseChange}>
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder={t("greenhouse.switchGreenhouse")} />
              </SelectTrigger>
              <SelectContent>
                {greenhouses.map((greenhouse) => (
                  <SelectItem key={greenhouse.id} value={greenhouse.id}>
                    {greenhouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2 rounded-lg border border-primary/20 bg-card/40 p-1">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors",
                  "hover:bg-primary/10 hover:text-primary",
                  active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GreenhouseSubnav;
