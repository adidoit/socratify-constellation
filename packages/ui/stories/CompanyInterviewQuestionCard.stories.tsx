import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CompanyInterviewQuestionCard, Question } from '../src/ui/company-interview-question-card';

const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'How would you improve YouTube?',
    company: 'Google',
    logoUrl: 'https://logo.clearbit.com/google.com',
  },
  {
    id: '2',
    text: 'Design a ride-sharing app for elderly users',
    company: 'Uber',
    logoUrl: 'https://logo.clearbit.com/uber.com',
  },
  {
    id: '3',
    text: 'What metrics would you track for Instagram Reels?',
    company: 'Meta',
    logoUrl: 'https://logo.clearbit.com/meta.com',
  },
  {
    id: '4',
    text: 'How would you monetize WhatsApp?',
    company: 'WhatsApp',
    logoUrl: 'https://logo.clearbit.com/whatsapp.com',
  },
];

const sampleQuestionsWithContext: Question[] = [
  {
    id: '1',
    text: 'What are the key drivers of airline profitability?',
    company: 'McKinsey',
    logoUrl: 'https://logo.clearbit.com/mckinsey.com',
    industry: 'Aviation',
    type: 'Operations',
  },
  {
    id: '2',
    text: 'How would you reduce costs in a hospital system?',
    company: 'BCG',
    logoUrl: 'https://logo.clearbit.com/bcg.com',
    industry: 'Healthcare',
    type: 'Strategy',
  },
  {
    id: '3',
    text: 'Design a go-to-market strategy for a new EV',
    company: 'Bain',
    logoUrl: 'https://logo.clearbit.com/bain.com',
    industry: 'Automotive',
    type: 'Marketing',
  },
  {
    id: '4',
    text: 'Evaluate the M&A opportunity for a fintech startup',
    company: 'Goldman Sachs',
    logoUrl: 'https://logo.clearbit.com/goldmansachs.com',
    industry: 'Financial Services',
    type: 'M&A',
  },
];

const meta = {
  title: 'Components/CompanyInterviewQuestionCard',
  component: CompanyInterviewQuestionCard,
  args: {
    question: sampleQuestions[0],
    onClick: (q: Question) => console.log('Clicked:', q.text),
    isSelected: false,
    variant: 'light',
    layout: 'company-only',
  },
  argTypes: {
    isSelected: {
      control: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['light', 'dark'],
    },
    layout: {
      control: 'select',
      options: ['company-only', 'full-context'],
    },
  },
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light-gray',
      values: [
        { name: 'light-gray', value: '#f5f5f5' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#18181b' },
        { name: 'darker', value: '#09090b' },
      ],
    },
  },
} satisfies Meta<typeof CompanyInterviewQuestionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Company-only layout stories
export const Light: Story = {
  args: {
    variant: 'light',
    layout: 'company-only',
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const LightSelected: Story = {
  args: {
    variant: 'light',
    isSelected: true,
    layout: 'company-only',
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    layout: 'company-only',
  },
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const DarkSelected: Story = {
  args: {
    variant: 'dark',
    isSelected: true,
    layout: 'company-only',
  },
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

// Full-context layout stories
export const FullContextLight: Story = {
  args: {
    question: sampleQuestionsWithContext[0],
    variant: 'light',
    layout: 'full-context',
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const FullContextLightSelected: Story = {
  args: {
    question: sampleQuestionsWithContext[0],
    variant: 'light',
    isSelected: true,
    layout: 'full-context',
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const FullContextDark: Story = {
  args: {
    question: sampleQuestionsWithContext[0],
    variant: 'dark',
    layout: 'full-context',
  },
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const FullContextDarkSelected: Story = {
  args: {
    question: sampleQuestionsWithContext[0],
    variant: 'dark',
    isSelected: true,
    layout: 'full-context',
  },
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

// Grid layouts
export const LightGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
      {sampleQuestions.map((q, i) => (
        <CompanyInterviewQuestionCard
          key={q.id}
          question={q}
          onClick={(question) => console.log('Clicked:', question.text)}
          variant="light"
          isSelected={i === 0}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light-gray' },
  },
};

export const DarkGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
      {sampleQuestions.map((q, i) => (
        <CompanyInterviewQuestionCard
          key={q.id}
          question={q}
          onClick={(question) => console.log('Clicked:', question.text)}
          variant="dark"
          isSelected={i === 0}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'darker' },
  },
};

export const FullContextGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
      {sampleQuestionsWithContext.map((q, i) => (
        <CompanyInterviewQuestionCard
          key={q.id}
          question={q}
          onClick={(question) => console.log('Clicked:', question.text)}
          variant="light"
          layout="full-context"
          isSelected={i === 0}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light-gray' },
  },
};

export const FullContextDarkGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
      {sampleQuestionsWithContext.map((q, i) => (
        <CompanyInterviewQuestionCard
          key={q.id}
          question={q}
          onClick={(question) => console.log('Clicked:', question.text)}
          variant="dark"
          layout="full-context"
          isSelected={i === 0}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'darker' },
  },
};

// Side by side comparison
export const SideBySide: Story = {
  render: () => (
    <div className="flex gap-8 p-8">
      <div className="p-8 rounded-3xl bg-stone-100">
        <CompanyInterviewQuestionCard
          question={sampleQuestions[0]}
          onClick={(q) => console.log('Clicked:', q.text)}
          variant="light"
        />
      </div>
      <div className="p-8 rounded-3xl bg-zinc-950">
        <CompanyInterviewQuestionCard
          question={sampleQuestions[0]}
          onClick={(q) => console.log('Clicked:', q.text)}
          variant="dark"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'white' },
  },
};

export const LayoutComparison: Story = {
  render: () => (
    <div className="flex gap-8 p-8 bg-stone-100">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium text-stone-500">Company Only</span>
        <CompanyInterviewQuestionCard
          question={sampleQuestionsWithContext[0]}
          onClick={(q) => console.log('Clicked:', q.text)}
          variant="light"
          layout="company-only"
        />
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium text-stone-500">Full Context</span>
        <CompanyInterviewQuestionCard
          question={sampleQuestionsWithContext[0]}
          onClick={(q) => console.log('Clicked:', q.text)}
          variant="light"
          layout="full-context"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'white' },
  },
};
