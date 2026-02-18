"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useTranslations } from "next-intl";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Compass,
  Code,
  Loader2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWalletAuth } from "@/components/providers/wallet-auth-provider";

const QUICK_PROMPTS = [
  {
    icon: Compass,
    label: "Which course should I start with?",
    message: "I'm new to Solana development. Which course should I start with?",
  },
  {
    icon: BookOpen,
    label: "Explain a concept",
    message:
      "Can you explain how Solana accounts and PDAs work in simple terms?",
  },
  {
    icon: Code,
    label: "Help with a challenge",
    message:
      "I'm stuck on a coding challenge. Can you give me some hints on how to approach it?",
  },
];

function getTextContent(message: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!message.parts) return "";
  return message.parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        p.type === "text" && Boolean(p.text),
    )
    .map((p) => p.text)
    .join("");
}

/* -------------------------------------------------------------------------- */
/*  Markdown renderer                                                         */
/* -------------------------------------------------------------------------- */

function MarkdownMessage({ content }: { content: string }) {
  // Split code blocks from the rest
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-[13px] leading-[1.65]">
      {segments.map((seg, i) => {
        // Fenced code block
        if (seg.startsWith("```")) {
          const langMatch = seg.match(/^```(\w+)?\n?/);
          const lang = langMatch?.[1] ?? "";
          const code = seg.replace(/```\w*\n?/, "").replace(/\n?```$/, "");
          return (
            <div
              key={i}
              className="my-2.5 rounded-lg border border-border/60 bg-background/60 overflow-hidden"
            >
              {lang && (
                <div className="px-3 py-1 text-[10px] font-mono text-muted-foreground border-b border-border/40 bg-secondary/30">
                  {lang}
                </div>
              )}
              <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          );
        }

        // Regular text — process line by line
        const lines = seg.split("\n");
        return <TextBlock key={i} lines={lines} />;
      })}
    </div>
  );
}

function TextBlock({ lines }: { lines: string[] }) {
  const elements: React.ReactNode[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const List = listBuffer.type === "ol" ? "ol" : "ul";
    elements.push(
      <List
        key={`list-${elements.length}`}
        className={cn(
          "my-1.5 space-y-1 pl-4",
          listBuffer.type === "ul" ? "list-disc" : "list-decimal",
          "[&>li]:text-foreground/90 [&>li::marker]:text-primary",
        )}
      >
        {listBuffer.items.map((item, i) => (
          <li key={i}>
            <InlineMarkdown text={item} />
          </li>
        ))}
      </List>,
    );
    listBuffer = null;
  };

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];

    // Empty line
    if (!line.trim()) {
      flushList();
      // Only add spacer if not consecutive blanks
      if (j > 0 && lines[j - 1]?.trim()) {
        elements.push(<div key={`br-${j}`} className="h-2" />);
      }
      continue;
    }

    // Heading: ### / ## / #
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      elements.push(
        <p
          key={`h-${j}`}
          className={cn(
            "font-semibold text-foreground mt-2.5 mb-1",
            level === 1 && "text-[15px]",
            level === 2 && "text-[14px]",
            level === 3 && "text-[13px]",
          )}
        >
          <InlineMarkdown text={text} />
        </p>,
      );
      continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^[\s]*[-*]\s+(.+)/);
    if (ulMatch) {
      if (listBuffer?.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer!.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^[\s]*(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (listBuffer?.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer!.items.push(olMatch[2]);
      continue;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={`p-${j}`} className="text-foreground/90">
        <InlineMarkdown text={line} />
      </p>,
    );
  }

  flushList();
  return <>{elements}</>;
}

function InlineMarkdown({ text }: { text: string }) {
  // Process bold, inline code, and links
  const parts: React.ReactNode[] = [];
  // Split on: **bold**, `code`, [text](url)
  const regex = /(\*\*.*?\*\*|`[^`]+`|\[.*?\]\(.*?\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-background/80 px-1.5 py-0.5 text-[11px] font-mono border border-border/50 text-primary/80"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/\[(.+?)\]\((.+?)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }
    lastIndex = match.index + token.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function AiAssistant() {
  const t = useTranslations("chat");
  const { isAuthenticated } = useWalletAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;
      setInput("");
      sendMessage({ text: trimmed });
    },
    [isBusy, sendMessage],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "h-14 w-14 hover:scale-105 active:scale-95",
          open && "scale-0 opacity-0 pointer-events-none",
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
          <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--gold))] text-[8px] font-bold text-background">
            AI
          </span>
        </span>
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all duration-300 origin-bottom-right",
          "w-[420px] h-[620px] max-h-[calc(100vh-3rem)]",
          open
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <Bot className="h-5 w-5 text-primary" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("title")}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={clearChat}
                title="New chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {t("welcomeTitle")}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("welcomeSubtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => send(prompt.message)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-secondary/50"
                  >
                    <prompt.icon className="h-4 w-4 text-primary shrink-0" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const text = getTextContent(m);
              if (!text && m.role === "assistant") return null;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2.5",
                    m.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
                      m.role === "user" ? "bg-primary/15" : "bg-primary/10",
                    )}
                  >
                    {m.role === "user" ? (
                      <User className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-secondary/50 text-foreground rounded-tl-md",
                    )}
                  >
                    {m.role === "user" ? (
                      <p className="text-[13px] leading-relaxed">{text}</p>
                    ) : (
                      <MarkdownMessage content={text} />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {status === "submitted" && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-secondary/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t("placeholder")}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 max-h-24"
              style={{ height: "auto", minHeight: "40px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 96) + "px";
              }}
            />
            <Button
              type="button"
              size="icon"
              disabled={!input.trim() || isBusy}
              onClick={() => send(input)}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 disabled:opacity-40"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-center text-muted-foreground/50">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </>
  );
}
