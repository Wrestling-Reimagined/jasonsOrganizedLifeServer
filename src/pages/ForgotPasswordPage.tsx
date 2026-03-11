import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useFeedback } from "../ui/FeedbackProvider";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { showToast, withSplash } = useFeedback();
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await withSplash("Generating reset token...", () =>
        apiRequest<{ message: string; resetToken?: string }>("/auth/forgot-password", {
          method: "POST",
          body: { email },
          authenticated: false,
        }),
      );
      showToast(result.message, "success");
      setToken(result.resetToken ?? null);
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper sx={{ width: 480, p: 4 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Forgot password
        </Typography>
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {token && (
            <Alert severity="info">
              Dev reset token: <strong>{token}</strong>
            </Alert>
          )}
          <Button type="submit" variant="contained">
            Generate reset token
          </Button>
          <Button component={Link} to="/reset-password">
            Go to reset page
          </Button>
          <Button component={Link} to="/login">
            Back to login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
