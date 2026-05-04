import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { User, Mail, Lock, Save, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      await updateProfile(firstName, lastName);
      toast.success(t("profile.profileUpdated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("profile.subtitle"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("profile.newPasswordMismatch"));
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success(t("profile.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("profile.subtitle"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-foreground">{t("profile.title")}</span>{" "}
            <span className="text-primary glow-text">{t("profile.settings")}</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("profile.subtitle")}
          </p>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t("profile.personalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                      <Input
                        id="lastName"
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
                        value={user?.email || ""}
                        className="pl-10 bg-muted/50"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.emailCannotChange")}
                    </p>
                  </div>

                  <Button type="submit" variant="neon" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      />
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t("profile.saved")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t("profile.saveChanges")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  {t("profile.changePassword")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={128}
                      pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">{t("profile.confirmNewPassword")}</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={128}
                      pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
                      required
                    />
                  </div>

                  <Button type="submit" variant="outline" disabled={isSavingPassword}>
                    {t("profile.updatePassword")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
