"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";

import { useEffect, useState, useRef } from "react";
import {
  AI_NAME,
  CLEAR_CHAT_TEXT,
  OWNER_NAME,
  WELCOME_MESSAGE,
} from "@/config";

import Image from "next/image";
import Link from "next/link";


// -------------------------------
//   FORM SCHEMA
// -------------------------------

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});


// -------------------------------
//   LOCAL STORAGE HANDLING
// -------------------------------

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = () => {
  if (typeof window === "undefined")
    return { messages: [], durations: {} };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored)
      return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (err) {
    console.error("Failed to load messages:", err);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (
  messages: UIMessage[],
  durations: Record<string, number>
) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save messages:", err);
  }
};


// -------------------------------
//           PAGE
// -------------------------------

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef(false);

  const stored =
    typeof window !== "undefined"
      ? loadMessagesFromStorage()
      : { messages: [], durations: {} };

  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  // Mark page as client & load storage
  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [messages, durations, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((d) => ({ ...d, [key]: duration }));
  };

  // Show welcome message once
  useEffect(() => {
    if (
      isClient &&
      initialMessages.length === 0 &&
      !welcomeMessageShownRef.current
    ) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);


  // -------------------------------
  //        FORM HANDLING
  // -------------------------------

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  // Clear chat
  function clearChat() {
    const empty: UIMessage[] = [];
    const emptyDurations = {};
    setMessages(empty);
    setDurations(emptyDurations);
    saveMessagesToStorage(empty, emptyDurations);
    toast.success("Chat cleared");
  }


  // -------------------------------
  //   Finance-Relevant Quick Actions
  // -------------------------------

  const financeSuggestions = [
    "Top 5 High-Yield Savings Accounts today",
    "Best 1-year CD with highest APY",
    "Compare credit cards for travel rewards",
    "Which bank has no-fee savings?",
    "Latest APY trends (updated now)",
    "Is a Money Market Account better today?",
  ];


  // -------------------------------
  //              UI
  // -------------------------------

  return (
    <div className="flex h-screen items-center justify-center font-sans dark:bg-black">
      <main className="w-full dark:bg-black h-screen relative">

        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b pb-3">
          <ChatHeader>
            <ChatHeaderBlock />

            <ChatHeaderBlock className="justify-center items-center gap-2">
              <Avatar className="size-8 ring-1 ring-primary">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>🐷</AvatarFallback>
              </Avatar>
              <p className="tracking-tight font-semibold text-sm">
                Finatic AI — Real-Time Financial Insights
              </p>
            </ChatHeaderBlock>

            <ChatHeaderBlock className="justify-end">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Plus className="size-4" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>


        {/* BODY */}
        <div className="h-screen overflow-y-auto px-5 pt-[96px] pb-[150px] w-full">
          <div className="flex flex-col items-center justify-end min-h-full">
            {isClient ? (
              <>
                <MessageWall
                  messages={messages}
                  status={status}
                  durations={durations}
                  onDurationChange={handleDurationChange}
                />

                {/* Loader */}
                {status === "submitted" && (
                  <div className="flex justify-start max-w-3xl w-full">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Finance Suggestion Chips */}
                <div className="flex flex-wrap gap-2 mt-6 max-w-3xl w-full opacity-80">
                  {financeSuggestions.map((s) => (
                    <button
                      key={s}
                      className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs transition"
                      onClick={() => form.setValue("message", s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex justify-center max-w-2xl w-full">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>


        {/* FOOTER INPUT */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg pt-4 pb-3 border-t">
          <div className="w-full px-5 items-center flex justify-center relative">
            <div className="max-w-3xl w-full">
              <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="chat-form-message" className="sr-only">
                          Message
                        </FieldLabel>

                        <div className="relative h-13">
                          <Input
                            {...field}
                            id="chat-form-message"
                            className="h-14 pr-16 pl-5 bg-card rounded-[20px]"
                            placeholder="Ask me for the best APY, CDs, credit cards…"
                            disabled={status === "streaming"}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />

                          {/* Send / Stop buttons */}
                          {status === "ready" || status === "error" ? (
                            <Button
                              className="absolute right-3 top-3 rounded-full"
                              type="submit"
                              size="icon"
                              disabled={!field.value.trim()}
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              className="absolute right-3 top-3 rounded-full"
                              size="icon"
                              onClick={stop}
                            >
                              <Square className="size-4" />
                            </Button>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>

          {/* FOOTER TEXT */}
          <div className="w-full px-5 py-3 flex justify-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {OWNER_NAME}. &nbsp;
            <Link href="/terms" className="underline">Terms</Link> &nbsp;·&nbsp;
            <span>Finatic AI uses real-time data tools but is NOT financial advice.</span>
          </div>
        </div>

      </main>
    </div>
  );
}
