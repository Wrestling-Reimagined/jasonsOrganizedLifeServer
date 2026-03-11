import {
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "../api/client";
import type { Payment } from "../types";
import { useFeedback } from "../ui/FeedbackProvider";

export const FinancePage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const { showToast, withSplash } = useFeedback();
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [category, setCategory] = useState("Groceries");
  const [notes, setNotes] = useState("");
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);

  const loadPayments = async (withBlockingSplash = false) => {
    const operation = async () => {
      const next = await apiRequest<Payment[]>("/payments");
      setPayments(next);
    };

    try {
      if (withBlockingSplash) {
        await withSplash("Loading payments...", operation);
      } else {
        await operation();
      }
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  useEffect(() => {
    void loadPayments(true);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await withSplash("Saving payment...", () =>
        apiRequest("/payments", {
          method: "POST",
          body: {
            amount: Number(amount),
            paidAt: new Date(paidAt).toISOString(),
            category,
            notes: notes || undefined,
          },
        }),
      );
      setAmount("");
      setNotes("");
      setShowAddPaymentForm(false);
      await loadPayments();
      showToast("Payment saved.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const deletePayment = async (id: number) => {
    try {
      await withSplash("Deleting payment...", () => apiRequest(`/payments/${id}`, { method: "DELETE" }));
      await loadPayments();
      showToast("Payment deleted.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Finance</Typography>

      <Paper sx={{ p: 2 }}>
        <Button variant="contained" onClick={() => setShowAddPaymentForm((current) => !current)}>
          {showAddPaymentForm ? "Hide form" : "Add payment"}
        </Button>
        <Collapse in={showAddPaymentForm}>
          <Stack component="form" spacing={2} onSubmit={onSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Amount"
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <TextField
              label="Date and time"
              type="datetime-local"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button type="submit" variant="contained">
              Save payment
            </Button>
          </Stack>
        </Collapse>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Payment history</Typography>
        <List>
          {payments.map((payment) => (
            <ListItem
              key={payment.id}
              secondaryAction={
                <Button color="error" onClick={() => deletePayment(payment.id)}>
                  Delete
                </Button>
              }
            >
              <ListItemText
                primary={`$${payment.amount.toFixed(2)} - ${payment.category}`}
                secondary={`${dayjs(payment.paidAt).format("MMM D, YYYY h:mm A")}${payment.notes ? ` | ${payment.notes}` : ""}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Stack>
  );
};
