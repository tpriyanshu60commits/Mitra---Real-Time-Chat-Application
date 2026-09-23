import { useEffect, useState, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Module-level state to ensure Google Identity Services is only initialized once across the app
let isGsiInitialized = false;
let activeAuthCallbacks = {
  onSuccess: null,
  onFailure: null,
};

// Master callback dispatched by Google Identity Services
const handleMasterCredentialResponse = (response) => {
  try {
    if (!response?.credential) {
      throw new Error("No credential returned from Google");
    }

    // Decode JWT payload
    const payload = JSON.parse(atob(response.credential.split(".")[1]));
    const userData = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      imageUrl: payload.picture,
      idToken: response.credential,
    };

    console.log("Google sign-in successful:", userData);
    activeAuthCallbacks.onSuccess?.(userData);
  } catch (error) {
    console.error("Error processing Google credential:", error);
    activeAuthCallbacks.onFailure?.(error);
  }
};

// Custom hook for Google Authentication
export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(!isGsiInitialized);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(isGsiInitialized);
  const tempButtonContainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (!GOOGLE_CLIENT_ID) {
      if (isMounted) {
        setError("Google Client ID not configured");
        setIsLoading(false);
      }
      return;
    }

    const initializeGoogleAuth = () => {
      try {
        if (!isGsiInitialized && window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleMasterCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          isGsiInitialized = true;
          console.log("Google Identity Services initialized successfully");
        }

        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error("Google Identity Services initialization failed:", err);
        if (isMounted) {
          setError("Failed to initialize Google Auth");
          setIsLoading(false);
        }
      }
    };

    // If already loaded and initialized
    if (window.google?.accounts?.id) {
      initializeGoogleAuth();
      return;
    }

    // Check if script is already added to DOM by previous mount
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      const handleLoad = () => {
        if (isMounted) initializeGoogleAuth();
      };
      existingScript.addEventListener("load", handleLoad);
      return () => {
        isMounted = false;
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    // Append script once
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (isMounted) {
        console.log("Google Identity Services script loaded");
        initializeGoogleAuth();
      }
    };

    script.onerror = (err) => {
      console.error("Failed to load Google Identity Services script:", err);
      if (isMounted) {
        setError("Failed to load Google Identity Services");
        setIsLoading(false);
      }
    };

    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithGoogle = (onSuccess, onFailure) => {
    if (!window.google?.accounts?.id || !isInitialized) {
      console.log("Google Identity Services not ready");
      setError("Google Auth not ready");
      onFailure?.({ message: "Google Auth not ready" });
      return;
    }

    try {
      // Store current attempt callbacks
      activeAuthCallbacks = {
        onSuccess,
        onFailure,
      };

      setError(null);

      // Clean up previous temp button container if any exists
      if (tempButtonContainerRef.current && document.body.contains(tempButtonContainerRef.current)) {
        document.body.removeChild(tempButtonContainerRef.current);
      }

      // Create a temporary off-screen button
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      tempDiv.id = "temp-google-button";
      document.body.appendChild(tempDiv);
      tempButtonContainerRef.current = tempDiv;

      // Render button once to trigger Google auth popup
      window.google.accounts.id.renderButton(tempDiv, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "continue_with",
      });

      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]');
        if (googleButton) {
          googleButton.click();
        } else {
          setError("Could not trigger Google sign-in");
          onFailure?.({ message: "Could not trigger Google sign-in" });
        }

        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
          if (tempButtonContainerRef.current === tempDiv) {
            tempButtonContainerRef.current = null;
          }
        }, 1000);
      }, 100);
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed");
      onFailure?.(err);
    }
  };

  return {
    isLoading,
    error,
    isInitialized,
    signInWithGoogle,
  };
};

