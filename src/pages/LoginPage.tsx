import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useFeedback } from "../ui/FeedbackProvider";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast, withSplash } = useFeedback();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await withSplash("Logging in...", () =>
        apiRequest<{ token: string; user: { id: number; email: string } }>("/auth/login", {
          method: "POST",
          body: { email, password },
          authenticated: false,
        }),
      );
      login(result.token, result.user);
      showToast("Logged in successfully.", "success");
      navigate("/");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper sx={{ width: 420, p: 4 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Login
        </Typography>
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="contained">
            Log in
          </Button>
          <Button component={Link} to="/signup">
            Create account
          </Button>
          <Button component={Link} to="/forgot-password">
            Forgot password
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
