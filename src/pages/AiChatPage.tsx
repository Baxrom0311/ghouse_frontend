import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, LoaderCircle, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const AiChatPage: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("assistant.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const suggestions = useMemo(
    () => [
      t("assistant.exampleSummary"),
      t("assistant.exampleDevices"),
      t("assistant.exampleAi"),
    ],
    [t],
  );

  const sendMessage = async (customMessage?: string) => {
    const message = (customMessage ?? input).trim();
    if (!message || sending) {
      return;
    }

    const history = messages.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setSending(true);

    try {
      const response = await apiFetch<{ reply: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      });

      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.reply },
      ]);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : t("assistant.error");
      toast.error(detail);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: detail },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">
                <span className="text-foreground">{t("assistant.title")}</span>{" "}
                <span className="text-primary glow-text">
                  {t("assistant.titleHighlight")}
                </span>
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("assistant.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer border-primary/40 px-3 py-2 text-xs text-primary hover:bg-primary/10"
                  onClick={() => void sendMessage(suggestion)}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <Card variant="glass" className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                {t("assistant.chatTitle")}
              </CardTitle>
              <CardDescription>{t("assistant.chatDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[55vh] rounded-xl border border-primary/20 bg-background/40 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
                          message.role === "user"
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-primary/20 bg-card/80 text-muted-foreground"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
                          {message.role === "user" ? (
                            <User className="w-3 h-3 text-primary" />
                          ) : (
                            <Bot className="w-3 h-3 text-primary" />
                          )}
                          <span className="text-primary">
                            {message.role === "user"
                              ? t("assistant.you")
                              : t("assistant.bot")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-primary/20 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <LoaderCircle className="w-4 h-4 animate-spin text-primary" />
                          {t("assistant.thinking")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator className="bg-primary/20" />

              <div className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t("assistant.placeholder")}
                  className="min-h-[120px] border-primary/30 bg-background/60"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    {t("assistant.footer")}
                  </p>
                  <Button
                    variant="neon"
                    onClick={() => void sendMessage()}
                    disabled={sending || !input.trim()}
                  >
                    {sending ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {t("assistant.send")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AiChatPage;
