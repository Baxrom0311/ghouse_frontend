import React from "react";
import { AlertTriangle } from "lucide-react";
import { withTranslation, type WithTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryBase extends React.Component<
  React.PropsWithChildren<WithTranslation>,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled React error", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { t } = this.props;
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <section className="w-full max-w-md rounded-lg border border-destructive/30 bg-card p-6 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="mb-2 text-xl font-semibold">{t("common.appErrorTitle")}</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {t("common.appErrorDescription")}
          </p>
          <Button onClick={() => window.location.reload()}>
            {t("common.reload")}
          </Button>
        </section>
      </main>
    );
  }
}

const ErrorBoundary = withTranslation()(ErrorBoundaryBase);

export default ErrorBoundary;
