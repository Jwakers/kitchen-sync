"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold">You&apos;re Offline</h1>
        <p className="mb-6 text-muted-foreground">
          It looks like you&apos;re not connected to the internet. Please check
          your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
