import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, firstName, lastName);
      toast.success(t("auth.registerSuccess"));
      navigate("/dashboard");
    } catch (_error) {
      toast.error(t("auth.registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 dark:bg-primary/10 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 geometric-bg" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
        />
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">AgroAi</h2>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto">
              Issiqxonangizni avtomatlashtirishni bugun boshlang. Bepul ro'yxatdan o'ting.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              {["Bepul", "5 issiqxona", "AI chat", "Real-time"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40"
          >
            <Leaf className="w-7 h-7 text-primary" />
          </motion.div>
          <span className="font-display text-2xl font-bold tracking-wider text-primary glow-text">
            AgroAi
          </span>
        </Link>

        <Card variant="glass">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("auth.createAccount")}</CardTitle>
            <CardDescription>{t("auth.startAutomating")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                  <Input
                    id="lastName"
                    placeholder="Farmer"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@agroai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    minLength={8}
                    maxLength={128}
                    pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={8}
                    maxLength={128}
                    pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {t("auth.createAccount")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-muted-foreground">{t("auth.hasAccount")} </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t("auth.signIn")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
