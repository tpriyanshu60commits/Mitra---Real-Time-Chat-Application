import { useEffect, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Custom hook for Google Authentication
export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured");
      setIsLoading(false);
      return;
    }

    const loadGoogleIdentityServices = () => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
          reject(new Error("Google Auth only works in the browser."));
          return;
        }

        // Check if Google Identity Services is already loaded
        if (window.google?.accounts?.id) {
          console.log("Google Identity Services already loaded");
          initializeGoogleAuth();
          resolve();
          return;
        }

        // Load Google Identity Services script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log("Google Identity Services script loaded");
          initializeGoogleAuth();
          resolve();
        };

        script.onerror = (error) => {
          console.error(
            "Failed to load Google Identity Services script:",
            error
          );
          setError("Failed to load Google Identity Services");
          setIsLoading(false);
          reject(error);
        };

        document.head.appendChild(script);
      });
    };

    const initializeGoogleAuth = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: () => {}, // Will be set when sign-in is called
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        console.log("Google Identity Services initialized successfully");
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Google Identity Services initialization failed:", error);
        setError("Failed to initialize Google Auth");
        setIsLoading(false);
      }
    };

    loadGoogleIdentityServices().catch((error) => {
      console.error("Google Auth setup failed:", error);
      setError("Google Auth setup failed");
      setIsLoading(false);
    });
  }, []);

  const signInWithGoogle = (onSuccess, onFailure) => {
    if (!window.google?.accounts?.id || !isInitialized) {
      console.log("Google Identity Services not ready");
      setError("Google Auth not ready");
      onFailure?.({ message: "Google Auth not ready" });
      return;
    }

    try {
      // Set up the callback for this specific sign-in attempt
      const handleCredentialResponse = (response) => {
        try {
          // Decode the JWT token to get user info
          const payload = JSON.parse(atob(response.credential.split(".")[1]));

          const userData = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            imageUrl: payload.picture,
            idToken: response.credential,
          };

          console.log("Google sign-in successful:", userData);
          onSuccess?.(userData);
        } catch (error) {
          console.error("Error processing Google credential:", error);
          setError("Failed to process Google credential");
          onFailure?.(error);
        }
      };

      // Update the callback
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear any previous errors
      setError(null);

      // Create a temporary invisible button and click it programmatically
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      tempDiv.id = "temp-google-button";
      document.body.appendChild(tempDiv);

      // Render Google button in the temporary div
      window.google.accounts.id.renderButton(tempDiv, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "continue_with",
      });

      // Find the actual Google button and click it
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]');
        if (googleButton) {
          googleButton.click();
        } else {
          setError("Could not trigger Google sign-in");
          onFailure?.({ message: "Could not trigger Google sign-in" });
        }

        // Clean up the temporary element after a delay
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 1000);
      }, 100);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed");
      onFailure?.(error);
    }
  };

  return {
    isLoading,
    error,
    isInitialized,
    signInWithGoogle,
  };
};
