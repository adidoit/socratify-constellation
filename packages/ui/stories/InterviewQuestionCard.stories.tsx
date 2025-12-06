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
];

const meta = {
  title: 'Components/InterviewQuestionCard',
  component: InterviewQuestionCard,
  args: {
    question: sampleQuestions[0],
    onClick: (q: Question) => console.log('Clicked:', q.text),
    isSelected: false,
  },
  argTypes: {
    isSelected: {
      control: 'boolean',
    },
  },
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light-gray',
      values: [
        { name: 'light-gray', value: '#f5f5f5' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
} satisfies Meta<typeof InterviewQuestionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const UberQuestion: Story = {
  args: {
    question: sampleQuestions[1],
  },
};

export const MetaQuestion: Story = {
  args: {
    question: sampleQuestions[2],
  },
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {sampleQuestions.map((q) => (
        <InterviewQuestionCard
          key={q.id}
          question={q}
          onClick={(question) => console.log('Clicked:', question.text)}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
