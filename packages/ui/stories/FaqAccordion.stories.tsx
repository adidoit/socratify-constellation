import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FaqAccordion, type FaqItem } from "../src/ui/faq-accordion";

const socratifyFaq: FaqItem[] = [
  {
    id: "what-is-socratify",
    question: "What is Socratify?",
    answer: (
      <div className="space-y-3">
        <p>
          Socratify is a <strong>conversational AI coach for business skills</strong>.
          It gives you a safe space to practice clear thinking and articulate communication.
        </p>
        <p>
          Every prompt is designed to <strong>pressure-test your point of view</strong> on real business
          challenges, so you leave each session sharper than you started.
        </p>
      </div>
    ),
    answerPlainText:
      "Socratify is a conversational AI coach for business skills. It provides a safe space to practice clear thinking and articulate communication while pressure-testing your point of view on real business challenges.",
  },
  {
    id: "who-is-it-for",
    question: "Who is Socratify for?",
    answer: (
      <div className="space-y-3">
        <p>
          Ambitious professionals, students, and career changers who want to{" "}
          <strong>think more critically and speak with confidence</strong>.
        </p>
        <p>
          Whether you are preparing for a role, aiming for promotion, or exploring a new domain,
          Socratify adapts to your context.
        </p>
      </div>
    ),
    answerPlainText:
      "Socratify is for ambitious professionals, students, and career changers who want to think critically and speak with confidence. It adapts to your role, promotion goals, or new domain.",
  },
  {
    id: "how-does-it-work",
    question: "How does it work?",
    answer: (
      <div className="space-y-3">
        <p>
          Choose a prompt on a timely business topic, share your perspective, and the AI
          will <strong>challenge your reasoning with follow-up questions</strong>.
        </p>
        <p>
          Each dialogue is <strong>simulated hundreds of times</strong> behind the scenes to keep the feedback sharp,
          fast, and grounded in realistic scenarios.
        </p>
      </div>
    ),
    answerPlainText:
      "Pick a prompt on a business topic, share your perspective, and Socratify challenges your reasoning with follow-up questions. Each dialogue is simulated hundreds of times to deliver sharp, realistic feedback.",
  },
  {
    id: "why-use-it",
    question: "Why should I use it?",
    answer: (
      <div className="space-y-4">
        <blockquote className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">
            “The happiness of your life depends upon the quality of your thoughts.”
          </p>
          <p className="text-xs text-muted-foreground mt-2">— Marcus Aurelius, Meditations</p>
        </blockquote>
        <p>
          Socratify builds <strong>rigorous thinking habits</strong> so you can communicate crisply,
          make faster decisions, and stay sharp in the age of AI.
        </p>
      </div>
    ),
    answerPlainText:
      "Socratify builds rigorous thinking habits so you can communicate crisply, make faster decisions, and stay sharp in the age of AI.",
  },
];

const meta: Meta<typeof FaqAccordion> = {
  title: "UI/FaqAccordion",
  component: FaqAccordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FaqAccordion>;

export const Default: Story = {
  args: {
    items: socratifyFaq,
    title: "Frequently asked questions",
    subtitle: "How Socratify’s conversational coaching fits into your workflow.",
    badge: "FAQ",
    defaultOpenId: socratifyFaq[0].id,
    includeJsonLd: true,
  },
};

export const AllowMultiple: Story = {
  args: {
    items: socratifyFaq,
    title: "Product questions",
    subtitle: "Let learners browse multiple answers at once.",
    badge: "Learn",
    allowMultiple: true,
  },
};

export const CompactList: Story = {
  args: {
    items: socratifyFaq.slice(0, 2),
    title: "Quick answers",
    subtitle: "Use in onboarding or empty states.",
    defaultOpenId: socratifyFaq[1].id,
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark w-full max-w-5xl rounded-3xl bg-[#0f0f0f] p-6">
      <FaqAccordion
        items={socratifyFaq}
        title="FAQs in dark mode"
        subtitle="Tokens, typography, and micro-interactions adapt to the dark surface."
        badge="Support"
        allowMultiple
      />
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
};
