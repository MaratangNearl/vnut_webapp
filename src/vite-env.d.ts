/// <reference types="vite/client" />

interface Window {
  turnstile?: {
    render: (
      container: HTMLElement | string,
      options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback"?: (err: unknown) => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "flexible" | "compact" | "invisible";
      }
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
  };
}
