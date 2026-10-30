"use client";
import { SignInCard } from "@un-eosg/ui/components/sign-in-card";
import { requestMagicLink } from "../commands";
export function LoginForm() {
  return (
    <SignInCard
      headingLevel="h1"
      onSubmit={requestMagicLink}
      labels={{
        title: "Sign in",
        intro:
          "Enter your organisational email address to receive a sign-in link.",
        emailLabel: "Email address",
        emailPlaceholder: "your.name@un.org",
        submit: "Send sign-in link",
        submitting: "Sending…",
        sentTitle: "Check your email",
        sentBody: "We have sent a sign-in link to",
        sentHint:
          "The link expires in 15 minutes. Check your spam folder if it does not arrive.",
        errorMessage: "Could not send the email. Please try again.",
      }}
    />
  );
}
