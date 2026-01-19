"use client";

import { useUser } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import Script from "next/script";
import { useEffect } from "react";

const cannyAppId = process.env.NEXT_PUBLIC_CANNY_APP_ID;
const cannyBoardUrl = process.env.NEXT_PUBLIC_CANNY_BOARD_URL;

declare global {
  interface Window {
    Canny?: (...args: unknown[]) => void;
  }
}

export function CannyIdentify() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user || !cannyAppId) return;

    if (typeof window === "undefined") return;
    if (typeof window.Canny !== "function") return;

    window.Canny("identify", {
      appID: cannyAppId,
      user: {
        id: user.id,
        name: user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" "),
        email:
          user.primaryEmailAddress?.emailAddress ??
          user.emailAddresses[0]?.emailAddress,
        avatarURL: user.imageUrl,
        created: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : undefined,
      },
    });
  }, [isLoaded, user]);

  if (!cannyAppId) return null;

  return (
    <Script id="canny-sdk" strategy="afterInteractive">
      {`!function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://sdk.canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}}(window,document,"canny-jssdk","script");`}
    </Script>
  );
}

export function CannyFeedbackButton() {
  if (!cannyAppId || !cannyBoardUrl) return null;

  return (
    <a
      data-canny-link
      href={cannyBoardUrl}
      rel="noreferrer"
      target="_blank"
      aria-label="Leave feedback"
      className="fixed bottom-[calc(var(--nav-height,72px)_+_0.5rem)] left-4 z-50 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
    >
      <MessageSquare className="size-4" />
      <p>
      <span className="hidden sm:inline">Share </span>Feedback
      </p>
    </a>
  );
}

