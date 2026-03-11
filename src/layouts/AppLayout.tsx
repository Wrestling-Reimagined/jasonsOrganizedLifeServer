import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f7f7f7" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Personal Life Manager
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
            <Button color="inherit" component={RouterLink} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/food">
              Food
            </Button>
            <Button color="inherit" component={RouterLink} to="/finance">
              Finance
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
