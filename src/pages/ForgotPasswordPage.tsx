import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.passwordResetTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t("auth.passwordResetUnavailable")}
          </p>
          <Link to="/login">
            <Button variant="neon" className="w-full">
              {t("auth.backToLogin")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
