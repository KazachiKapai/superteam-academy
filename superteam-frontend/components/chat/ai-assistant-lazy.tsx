"use client";

import dynamic from "next/dynamic";

const AiAssistant = dynamic(
  () => import("@/components/chat/ai-assistant").then((mod) => mod.AiAssistant),
  { ssr: false },
);

export function LazyAiAssistant() {
  return <AiAssistant />;
}
