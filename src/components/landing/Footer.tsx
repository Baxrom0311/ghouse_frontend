import React from "react";
import { Leaf, Github, Send, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/30">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-primary">
                AgroAi
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered smart greenhouse monitoring and automation system.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com/Baxrom0311" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://t.me/baxrom_0311" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://gh.boos.uz" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground">Havolalar</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.documentation")}</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.support")}</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.privacy")}</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</a>
            </div>
          </div>

          {/* Tech */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground">Texnologiyalar</h4>
            <div className="flex flex-wrap gap-2">
              {["React", "FastAPI", "ESP32", "MQTT", "PostgreSQL", "AI"].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground border border-border">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AgroAi. {t("footer.rights")}
          </p>
          <p className="text-xs text-muted-foreground">
            Diplom loyihasi — Bahrom Reyimberganov
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
