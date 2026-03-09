import React from "react";
import { Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-12 border-t border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-wider text-primary">
              AgroAi
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("footer.terms")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("footer.documentation")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("footer.support")}
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgroAi. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
