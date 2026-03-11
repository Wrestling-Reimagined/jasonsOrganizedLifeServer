import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { FeedbackProvider } from "../ui/FeedbackProvider";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("renders login form", () => {
    render(
      <BrowserRouter>
        <FeedbackProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </FeedbackProvider>
      </BrowserRouter>,
    );

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
