import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, History, LoaderCircle, Plus, Send, Sparkles, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import GreenhouseSubnav from "@/components/greenhouse/GreenhouseSubnav";
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
import { useGreenhouse } from "@/contexts/useGreenhouse";
import { apiFetch } from "@/lib/api";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

interface ChatSessionItem {
  id: number;
  title: string | null;
  updated_at: string;
  scope: string;
  greenhouse_id: number | null;
}

interface ChatMessageItem {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const CONFIRMATION_PROMPT_PATTERN = /(tasdiqlayman|i confirm)/i;
const POST_CHAT_REFRESH_DELAYS_MS = [700, 1600, 3200];

const AiChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { id: greenhouseId } = useParams<{ id?: string }>();
  const { greenhouses, loading, refreshGreenhouses } = useGreenhouse();
  const greenhouse = greenhouseId
    ? greenhouses.find((item) => item.id === greenhouseId)
    : undefined;
  const isScoped = Boolean(greenhouseId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: isScoped
        ? t("assistant.scopedWelcome", {
            name: greenhouse?.name ?? t("assistant.thisGreenhouse"),
          })
        : t("assistant.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const refreshTimeoutsRef = useRef<number[]>([]);

  const loadSessions = useCallback(async () => {
    try {
      const params = isScoped ? `?greenhouse_id=${greenhouseId}` : "";
      const data = await apiFetch<ChatSessionItem[]>(`/ai/sessions${params}`);
      setSessions(data);
    } catch { /* ignore */ }
  }, [isScoped, greenhouseId]);

  const loadSession = useCallback(async (sid: number) => {
    try {
      const data = await apiFetch<ChatMessageItem[]>(`/ai/sessions/${sid}/messages`);
      setMessages(data.map((m) => ({ role: m.role, content: m.content })));
      setSessionId(sid);
      setShowSessions(false);
    } catch {
      toast.error(t("assistant.error"));
    }
  }, [t]);

  const startNewChat = () => {
    setSessionId(null);
    setMessages([{
      role: "assistant",
      content: isScoped
        ? t("assistant.scopedWelcome", { name: greenhouse?.name ?? t("assistant.thisGreenhouse") })
        : t("assistant.welcome"),
    }]);
    setShowSessions(false);
  };

  const deleteSession = async (sid: number) => {
    try {
      await apiFetch(`/ai/sessions/${sid}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sid));
      if (sessionId === sid) startNewChat();
    } catch { /* ignore */ }
  };

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    return () => {
      refreshTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      refreshTimeoutsRef.current = [];
    };
  }, []);

  const suggestions = useMemo(
    () =>
      isScoped
        ? [
            t("assistant.scopedExampleSummary"),
            t("assistant.scopedExampleDevices"),
            t("assistant.scopedExampleAi"),
          ]
        : [
            t("assistant.exampleSummary"),
            t("assistant.exampleDevices"),
            t("assistant.exampleAi"),
          ],
    [isScoped, t],
  );

  const schedulePostChatRefresh = () => {
    refreshTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    refreshTimeoutsRef.current = POST_CHAT_REFRESH_DELAYS_MS.map((delay) =>
      window.setTimeout(() => {
        void refreshGreenhouses().catch(() => undefined);
      }, delay),
    );
  };

  const shouldShowConfirmButton = (message: ChatMessage, index: number) =>
    message.role === "assistant" &&
    index === messages.length - 1 &&
    !sending &&
    CONFIRMATION_PROMPT_PATTERN.test(message.content);

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
      const endpoint = isScoped
        ? `/greenhouses/${greenhouseId}/ai/chat`
        : "/ai/chat";
      const response = await apiFetch<{ reply: string; session_id?: number }>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify({ message, history, session_id: sessionId }),
        },
      );

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.reply },
      ]);
      schedulePostChatRefresh();
      void loadSessions();
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

  if (isScoped && !greenhouse && loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="rounded-lg border border-primary/20 bg-card/40 p-6 text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          <div className={isScoped ? "space-y-4" : "flex flex-col gap-4 md:flex-row md:items-end md:justify-between"}>
            {isScoped && greenhouseId ? (
              <div className="w-full">
                <GreenhouseSubnav
                  greenhouseId={greenhouseId}
                  greenhouseName={greenhouse?.name ?? t("assistant.thisGreenhouse")}
                  subtitle={t("assistant.scopedSubtitle")}
                />
              </div>
            ) : (
              <div className="min-w-0">
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
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSessions(!showSessions); if (!showSessions) void loadSessions(); }}
                className="text-muted-foreground hover:text-primary"
              >
                <History className="w-4 h-4 mr-1" />
                {t("assistant.chatTitle")}
              </Button>
              {sessionId && (
                <Button variant="ghost" size="sm" onClick={startNewChat} className="text-muted-foreground hover:text-primary">
                  <Plus className="w-4 h-4 mr-1" />
                </Button>
              )}
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

          {showSessions && sessions.length > 0 && (
            <Card variant="default" className="border-primary/20">
              <CardContent className="p-3">
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center gap-1">
                        <button
                          onClick={() => void loadSession(session.id)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            sessionId === session.id
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <span className="block truncate font-medium">
                            {session.title || "Chat"}
                          </span>
                          <span className="text-xs opacity-60">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </span>
                        </button>
                        <button
                          onClick={() => void deleteSession(session.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

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
                        {shouldShowConfirmButton(message, index) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="neon"
                              onClick={() =>
                                void sendMessage(t("assistant.confirmCommandMessage"))
                              }
                              disabled={sending}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {t("assistant.confirmCommand")}
                            </Button>
                          </div>
                        )}
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
                    {isScoped
                      ? t("assistant.scopedFooter")
                      : t("assistant.footer")}
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
