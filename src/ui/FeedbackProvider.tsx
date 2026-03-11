import { Alert, Backdrop, Box, CircularProgress, Snackbar, Typography } from "@mui/material";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ToastSeverity = "success" | "error" | "info" | "warning";

type FeedbackContextValue = {
  showToast: (message: string, severity?: ToastSeverity) => void;
  withSplash: <T>(message: string, operation: () => Promise<T>) => Promise<T>;
};

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<ToastSeverity>("info");
  const [splashMessage, setSplashMessage] = useState<string | null>(null);

  const showToast = (message: string, severity: ToastSeverity = "info") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const withSplash = async <T,>(message: string, operation: () => Promise<T>): Promise<T> => {
    setSplashMessage(message);
    try {
      return await operation();
    } finally {
      setSplashMessage(null);
    }
  };

  const value = useMemo(
    () => ({
      showToast,
      withSplash,
    }),
    [],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toastSeverity} variant="filled" onClose={() => setToastOpen(false)}>
          {toastMessage}
        </Alert>
      </Snackbar>
      <Backdrop open={Boolean(splashMessage)} sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <Box sx={{ textAlign: "center", color: "#fff" }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>{splashMessage}</Typography>
        </Box>
      </Backdrop>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextValue => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used inside FeedbackProvider.");
  }
  return context;
};
