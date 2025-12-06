import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CompanyInterviewQuestionCardGrid } from '../src/ui/company-interview-question-card-grid';
import { Question } from '../src/ui/company-interview-question-card';

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
  {
    id: '5',
    text: 'Design a new feature for Spotify playlists',
    company: 'Spotify',
    logoUrl: 'https://logo.clearbit.com/spotify.com',
  },
  {
    id: '6',
    text: 'How would you increase engagement on LinkedIn?',
    company: 'LinkedIn',
    logoUrl: 'https://logo.clearbit.com/linkedin.com',
  },
  {
    id: '7',
    text: 'Design a checkout flow for Amazon Go stores',
    company: 'Amazon',
    logoUrl: 'https://logo.clearbit.com/amazon.com',
  },
  {
    id: '8',
    text: 'How would you reduce churn for Netflix?',
    company: 'Netflix',
    logoUrl: 'https://logo.clearbit.com/netflix.com',
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
  {
    id: '5',
    text: 'Develop a pricing strategy for cloud services',
    company: 'Deloitte',
    logoUrl: 'https://logo.clearbit.com/deloitte.com',
    industry: 'Technology',
    type: 'Pricing',
  },
  {
    id: '6',
    text: 'Optimize supply chain for retail operations',
    company: 'Accenture',
    logoUrl: 'https://logo.clearbit.com/accenture.com',
    industry: 'Retail',
    type: 'Supply Chain',
  },
  {
    id: '7',
    text: 'Due diligence for a private equity acquisition',
    company: 'KKR',
    logoUrl: 'https://logo.clearbit.com/kkr.com',
    industry: 'Private Equity',
    type: 'Due Diligence',
  },
  {
    id: '8',
    text: 'Market entry strategy for emerging markets',
    company: 'Oliver Wyman',
    logoUrl: 'https://logo.clearbit.com/oliverwyman.com',
    industry: 'Consumer Goods',
    type: 'Market Entry',
  },
];

const meta = {
  title: 'Components/CompanyInterviewQuestionCardGrid',
  component: CompanyInterviewQuestionCardGrid,
  args: {
    questions: sampleQuestions,
    onQuestionClick: (q: Question) => console.log('Clicked:', q.text),
    variant: 'light',
    layout: 'company-only',
    showArrows: true,
    showIndicators: true,
    gap: 24,
    rows: 1,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['light', 'dark'],
    },
    layout: {
      control: 'select',
      options: ['company-only', 'full-context'],
    },
    showArrows: {
      control: 'boolean',
    },
    showIndicators: {
      control: 'boolean',
    },
    gap: {
      control: { type: 'range', min: 8, max: 48, step: 4 },
    },
    rows: {
      control: 'select',
      options: [1, 2],
    },
  },
  parameters: {
    layout: 'fullscreen',
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
} satisfies Meta<typeof CompanyInterviewQuestionCardGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  render: (args) => (
    <div className="py-12 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
          Practice Questions
        </h2>
        <p className="text-stone-600 mb-8 px-14">
          Select a question to start practicing
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
  },
  render: (args) => (
    <div className="py-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-zinc-100 mb-2 px-14">
          Practice Questions
        </h2>
        <p className="text-zinc-400 mb-8 px-14">
          Select a question to start practicing
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const FullContextLight: Story = {
  args: {
    questions: sampleQuestionsWithContext,
    layout: 'full-context',
  },
  render: (args) => (
    <div className="py-12 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
          Case Interview Questions
        </h2>
        <p className="text-stone-600 mb-8 px-14">
          Practice with real consulting interview questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const FullContextDark: Story = {
  args: {
    questions: sampleQuestionsWithContext,
    layout: 'full-context',
    variant: 'dark',
  },
  render: (args) => (
    <div className="py-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-zinc-100 mb-2 px-14">
          Case Interview Questions
        </h2>
        <p className="text-zinc-400 mb-8 px-14">
          Practice with real consulting interview questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const WithSelection: Story = {
  render: function Render(args) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
      <div className="py-12 bg-stone-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
            Practice Questions
          </h2>
          <p className="text-stone-600 mb-8 px-14">
            {selectedId
              ? `Selected: ${sampleQuestions.find((q) => q.id === selectedId)?.text}`
              : 'Click a card to select it'}
          </p>
          <CompanyInterviewQuestionCardGrid
            {...args}
            selectedQuestionId={selectedId}
            onQuestionClick={(q) => setSelectedId(q.id)}
          />
        </div>
      </div>
    );
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const FullContextWithSelection: Story = {
  args: {
    questions: sampleQuestionsWithContext,
    layout: 'full-context',
  },
  render: function Render(args) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
      <div className="py-12 bg-stone-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
            Case Interview Questions
          </h2>
          <p className="text-stone-600 mb-8 px-14">
            {selectedId
              ? `Selected: ${sampleQuestionsWithContext.find((q) => q.id === selectedId)?.text}`
              : 'Click a card to select it'}
          </p>
          <CompanyInterviewQuestionCardGrid
            {...args}
            selectedQuestionId={selectedId}
            onQuestionClick={(q) => setSelectedId(q.id)}
          />
        </div>
      </div>
    );
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const TwoRowsFullContext: Story = {
  args: {
    questions: sampleQuestionsWithContext,
    layout: 'full-context',
    rows: 2,
  },
  render: (args) => (
    <div className="py-12 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
          Browse All Case Questions
        </h2>
        <p className="text-stone-600 mb-8 px-14">
          Explore our full collection of consulting interview questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const TwoRowsFullContextDark: Story = {
  args: {
    questions: sampleQuestionsWithContext,
    layout: 'full-context',
    rows: 2,
    variant: 'dark',
  },
  render: (args) => (
    <div className="py-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-zinc-100 mb-2 px-14">
          Browse All Case Questions
        </h2>
        <p className="text-zinc-400 mb-8 px-14">
          Explore our full collection of consulting interview questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const NoArrows: Story = {
  args: {
    showArrows: false,
  },
  render: (args) => (
    <div className="py-12 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
          Swipe to Browse
        </h2>
        <p className="text-stone-600 mb-8 px-14">
          Drag or swipe to see more questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const TwoRowsLight: Story = {
  args: {
    rows: 2,
  },
  render: (args) => (
    <div className="py-12 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-900 mb-2 px-14">
          Browse All Questions
        </h2>
        <p className="text-stone-600 mb-8 px-14">
          Explore our full collection of interview questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const TwoRowsDark: Story = {
  args: {
    rows: 2,
    variant: 'dark',
  },
  render: (args) => (
    <div className="py-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-zinc-100 mb-2 px-14">
          Browse All Questions
        </h2>
        <p className="text-zinc-400 mb-8 px-14">
          Explore our full collection of interview questions
        </p>
        <CompanyInterviewQuestionCardGrid {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'darker' },
  },
};
