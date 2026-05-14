import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, User, LogOut, LayoutDashboard, Menu, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = isAuthenticated
    ? [
        { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, match: ["/dashboard", "/greenhouse"] },
        { to: "/assistant", label: t("nav.assistant"), icon: MessageSquare },
        { to: "/profile", label: t("nav.profile"), icon: User },
      ]
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/30">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-primary glow-text">
              AgroAi
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => {
              const isActive = link.match
                ? link.match.some((item) => location.pathname.startsWith(item))
                : location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-sm text-muted-foreground">
                  {t("nav.welcome")}, <span className="text-primary">{user?.firstName}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="neon" size="sm">
                    {t("nav.getStarted")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.match
                  ? link.match.some((item) => location.pathname.startsWith(item))
                  : location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-primary/10",
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  {t("nav.logout")}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                  >
                    {t("nav.getStarted")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
