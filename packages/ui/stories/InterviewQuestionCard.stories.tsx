import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterviewQuestionCard, Question } from '../src/ui/interview-question-card';

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

const meta = {
  title: 'Components/InterviewQuestionCard',
  component: InterviewQuestionCard,
  args: {
    question: sampleQuestions[0],
    onClick: (q: Question) => console.log('Clicked:', q.text),
    isSelected: false,
    variant: 'light',
  },
  argTypes: {
    isSelected: {
      control: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['light', 'dark'],
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
} satisfies Meta<typeof InterviewQuestionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: {
    variant: 'light',
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const LightSelected: Story = {
  args: {
    variant: 'light',
    isSelected: true,
  },
  parameters: {
    backgrounds: { default: 'light-gray' },
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
  },
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const DarkSelected: Story = {
  args: {
    variant: 'dark',
    isSelected: true,
  },
  parameters: {
    backgrounds: { default: 'darker' },
  },
};

export const LightGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
      {sampleQuestions.map((q, i) => (
        <InterviewQuestionCard
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
        <InterviewQuestionCard
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

export const SideBySide: Story = {
  render: () => (
    <div className="flex gap-8 p-8">
      <div className="p-8 rounded-3xl bg-stone-100">
        <InterviewQuestionCard
          question={sampleQuestions[0]}
          onClick={(q) => console.log('Clicked:', q.text)}
          variant="light"
        />
      </div>
      <div className="p-8 rounded-3xl bg-zinc-950">
        <InterviewQuestionCard
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
