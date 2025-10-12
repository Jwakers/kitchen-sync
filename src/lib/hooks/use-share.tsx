import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useShare() {
  const [canShare, setCanShare] = useState(false);

  const share = async (title: string, text: string, url?: string) => {
    if (!canShare) return;

    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;

      console.error("Failed to share", error);
      toast.error("Failed to share");
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      toast.error("Copy to clipboard isn't supported in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
      toast.error("Failed to copy to clipboard!");
    }
  };

  useEffect(() => {
    setCanShare(navigator.share !== undefined);
  }, []);

  return {
    canShare,
    copyToClipboard,
    share,
  };
}
