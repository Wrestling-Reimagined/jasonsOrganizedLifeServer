import { Card, CardContent, Stack, Typography } from "@mui/material";

export const DashboardPage = () => {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Food</Typography>
            <Typography variant="body2">
              Manage recipes and keep track of prepped meals and consumption.
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Finance</Typography>
            <Typography variant="body2">
              Record payments like groceries with category and notes.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
};
