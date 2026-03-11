import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useFeedback } from "../ui/FeedbackProvider";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast, withSplash } = useFeedback();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await withSplash("Updating password...", () =>
        apiRequest<{ message: string }>("/auth/reset-password", {
          method: "POST",
          body: { token, password },
          authenticated: false,
        }),
      );
      showToast("Password updated. You can log in now.", "success");
      navigate("/login");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper sx={{ width: 480, p: 4 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Reset password
        </Typography>
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <TextField
            label="Reset token"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <TextField
            label="New password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="contained">
            Update password
          </Button>
          <Button component={Link} to="/login">
            Back to login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
