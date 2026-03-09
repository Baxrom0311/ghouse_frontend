import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Password reset flow hali backend’da yoqilmagan. Hozircha demo login
            yoki admin orqali parolni yangilang.
          </p>
          <Link to="/login">
            <Button variant="neon" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
