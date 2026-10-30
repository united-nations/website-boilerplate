import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  LayoutDashboard,
  Mail,
  UserRound,
} from "lucide-react";
import { buttonVariants } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";
import { SiteShell } from "@/components/SiteShell";
import { getCurrentUser } from "@/features/auth/service";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "About" };
const features = [
  {
    icon: Mail,
    title: "Sign in without a password",
    description:
      "Use your organisational email address to receive a secure sign-in link. There is no password to remember.",
  },
  {
    icon: Building2,
    title: "Connect your organisation",
    description:
      "Choose your organisational entity from the UN directory, or enter a custom affiliation.",
  },
  {
    icon: LayoutDashboard,
    title: "Access your workspace",
    description:
      "Open the home page after signing in. Your session keeps your workspace available when you return.",
  },
  {
    icon: UserRound,
    title: "Manage your account",
    description:
      "View your account, update your affiliation or sign out using the avatar menu on every page.",
  },
];
const steps = [
  {
    title: "Enter your email",
    description:
      "Choose Get started and enter your organisational email address.",
  },
  {
    title: "Follow your sign-in link",
    description: "Open the email and follow the link within 15 minutes.",
  },
  {
    title: "Choose your organisation",
    description:
      "Select your entity, complete sign-in and start using your workspace.",
  },
];

export default async function About() {
  const user = await getCurrentUser();
  return (
    <SiteShell>
      <section
        className="mx-auto max-w-3xl space-y-6 py-8 text-center sm:py-12"
        aria-labelledby="about-heading"
      >
        <p className={typography.eyebrow}>{siteConfig.brand}</p>
        <h1 id="about-heading" className={typography.pageTitle}>
          Welcome to {siteConfig.name}
        </h1>
        <p
          className={`${typography.lead} mx-auto max-w-2xl text-muted-foreground`}
        >
          {siteConfig.description}
        </p>
        <p className={`${typography.prose} mx-auto max-w-2xl`}>
          Sign in with your organisational email, connect your organisation and
          access your workspace.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href={user ? "/" : "/login"}
            className={buttonVariants({ size: "lg" })}
          >
            {user ? "Open workspace" : "Get started"}
            <ArrowRight aria-hidden="true" />
          </Link>
          <a
            href="#features"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Explore features
          </a>
        </div>
      </section>
      <section
        id="features"
        aria-labelledby="features-heading"
        className="scroll-mt-24 py-12"
      >
        <h2
          id="features-heading"
          className={`${typography.sectionTitle} mb-8 text-center`}
        >
          Platform features
        </h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-un-blue-text">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className={typography.subTitle}>{title}</h3>
              </div>
              <p className={`${typography.body} text-muted-foreground`}>
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-labelledby="steps-heading"
        className="my-8 rounded-xl bg-muted px-6 py-10 sm:px-8"
      >
        <h2
          id="steps-heading"
          className={`${typography.sectionTitle} mb-8 text-center`}
        >
          Get started in three steps
        </h2>
        <ol aria-label="Getting started" className="grid gap-8 md:grid-cols-3">
          {steps.map(({ title, description }, index) => (
            <li key={title} className="space-y-3 text-center">
              <span
                aria-hidden="true"
                className={`${typography.sectionTitle} mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground`}
              >
                {index + 1}
              </span>
              <h3 className={typography.subTitle}>{title}</h3>
              <p className={`${typography.body} text-muted-foreground`}>
                {description}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </SiteShell>
  );
}
