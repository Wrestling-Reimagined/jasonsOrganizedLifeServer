import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "./index.css";
import { FeedbackProvider } from "./ui/FeedbackProvider";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#355c7d",
    },
    secondary: {
      main: "#6c5b7b",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <FeedbackProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </FeedbackProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
