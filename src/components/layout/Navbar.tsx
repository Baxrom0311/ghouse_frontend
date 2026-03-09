import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, User, LogOut, LayoutDashboard, Menu, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
        { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
        { to: "/assistant", label: t("nav.assistant"), icon: MessageSquare },
        { to: "/profile", label: t("nav.profile"), icon: User },
      ]
    : [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/20"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40"
            >
              <Leaf className="w-6 h-6 text-primary" />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-wider text-primary glow-text">
              AgroAi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-primary/20"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
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
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
