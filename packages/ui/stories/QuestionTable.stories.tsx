import React, { useState, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  QuestionTable,
  QuestionTableFilters,
  QuestionTablePagination,
} from "../src/ui/question-table";
import { Question } from "../src/ui/company-interview-question-card";

const sampleQuestions: Question[] = [
  {
    id: "1",
    text: "What are the key drivers of airline profitability?",
    company: "McKinsey",
    logoUrl: "https://logo.clearbit.com/mckinsey.com",
    industry: "Aviation",
    type: "Operations",
  },
  {
    id: "2",
    text: "How would you reduce costs in a hospital system?",
    company: "BCG",
    logoUrl: "https://logo.clearbit.com/bcg.com",
    industry: "Healthcare",
    type: "Strategy",
  },
  {
    id: "3",
    text: "Design a go-to-market strategy for a new EV",
    company: "Bain",
    logoUrl: "https://logo.clearbit.com/bain.com",
    industry: "Automotive",
    type: "Marketing",
  },
  {
    id: "4",
    text: "Evaluate the M&A opportunity for a fintech startup",
    company: "Goldman Sachs",
    logoUrl: "https://logo.clearbit.com/goldmansachs.com",
    industry: "Financial Services",
    type: "M&A",
  },
  {
    id: "5",
    text: "Develop a pricing strategy for cloud services",
    company: "Deloitte",
    logoUrl: "https://logo.clearbit.com/deloitte.com",
    industry: "Technology",
    type: "Pricing",
  },
  {
    id: "6",
    text: "Optimize supply chain for retail operations",
    company: "Accenture",
    logoUrl: "https://logo.clearbit.com/accenture.com",
    industry: "Retail",
    type: "Supply Chain",
  },
  {
    id: "7",
    text: "Due diligence for a private equity acquisition",
    company: "KKR",
    logoUrl: "https://logo.clearbit.com/kkr.com",
    industry: "Private Equity",
    type: "Due Diligence",
  },
  {
    id: "8",
    text: "Market entry strategy for emerging markets",
    company: "Oliver Wyman",
    logoUrl: "https://logo.clearbit.com/oliverwyman.com",
    industry: "Consumer Goods",
    type: "Market Entry",
  },
  {
    id: "9",
    text: "How would you improve customer retention for a SaaS company?",
    company: "McKinsey",
    logoUrl: "https://logo.clearbit.com/mckinsey.com",
    industry: "Technology",
    type: "Strategy",
  },
  {
    id: "10",
    text: "Analyze the competitive landscape of streaming services",
    company: "BCG",
    logoUrl: "https://logo.clearbit.com/bcg.com",
    industry: "Media",
    type: "Strategy",
  },
  {
    id: "11",
    text: "Design a loyalty program for a hotel chain",
    company: "Bain",
    logoUrl: "https://logo.clearbit.com/bain.com",
    industry: "Hospitality",
    type: "Marketing",
  },
  {
    id: "12",
    text: "Evaluate vertical integration opportunities in agriculture",
    company: "McKinsey",
    logoUrl: "https://logo.clearbit.com/mckinsey.com",
    industry: "Agriculture",
    type: "Operations",
  },
  {
    id: "13",
    text: "How would you turnaround a struggling airline?",
    company: "BCG",
    logoUrl: "https://logo.clearbit.com/bcg.com",
    industry: "Aviation",
    type: "Strategy",
  },
  {
    id: "14",
    text: "Design a digital transformation roadmap for a bank",
    company: "Deloitte",
    logoUrl: "https://logo.clearbit.com/deloitte.com",
    industry: "Financial Services",
    type: "Digital",
  },
  {
    id: "15",
    text: "Should this pharmaceutical company acquire a biotech startup?",
    company: "Goldman Sachs",
    logoUrl: "https://logo.clearbit.com/goldmansachs.com",
    industry: "Healthcare",
    type: "M&A",
  },
];

const meta: Meta<typeof QuestionTable> = {
  title: "Components/QuestionTable",
  component: QuestionTable,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "light-gray",
      values: [
        { name: "light-gray", value: "#f5f5f5" },
        { name: "white", value: "#ffffff" },
        { name: "dark", value: "#18181b" },
        { name: "darker", value: "#09090b" },
      ],
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuestionTable>;

export const Default: Story = {
  render: () => (
    <div className="p-8 bg-stone-100 min-h-screen">
      <QuestionTable
        questions={sampleQuestions}
        onQuestionClick={(q) => console.log("Clicked:", q.text)}
        layout="full-context"
      />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="p-8 bg-zinc-950 min-h-screen">
      <QuestionTable
        questions={sampleQuestions}
        onQuestionClick={(q) => console.log("Clicked:", q.text)}
        variant="dark"
        layout="full-context"
      />
    </div>
  ),
  parameters: {
    backgrounds: { default: "darker" },
  },
};

export const WithPagination: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [filters, setFilters] = useState<QuestionTableFilters>({
      company: null,
      industry: null,
      type: null,
    });

    // Simulate server-side filtering
    const filteredQuestions = useMemo(() => {
      return sampleQuestions.filter((q) => {
        if (filters.company && q.company !== filters.company) return false;
        if (filters.industry && q.industry !== filters.industry) return false;
        if (filters.type && q.type !== filters.type) return false;
        return true;
      });
    }, [filters]);

    // Simulate server-side pagination
    const paginatedQuestions = useMemo(() => {
      const start = (page - 1) * pageSize;
      return filteredQuestions.slice(start, start + pageSize);
    }, [filteredQuestions, page, pageSize]);

    const pagination: QuestionTablePagination = {
      page,
      pageSize,
      totalItems: filteredQuestions.length,
      totalPages: Math.ceil(filteredQuestions.length / pageSize),
    };

    return (
      <div className="p-8 bg-stone-100 min-h-screen">
        <QuestionTable
          questions={paginatedQuestions}
          onQuestionClick={(q) => console.log("Clicked:", q.text)}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          layout="full-context"
          companies={[...new Set(sampleQuestions.map((q) => q.company))]}
          industries={[
            ...new Set(
              sampleQuestions.map((q) => q.industry).filter(Boolean) as string[]
            ),
          ]}
          types={[
            ...new Set(
              sampleQuestions.map((q) => q.type).filter(Boolean) as string[]
            ),
          ]}
        />
      </div>
    );
  },
};

export const WithPaginationDark: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [filters, setFilters] = useState<QuestionTableFilters>({
      company: null,
      industry: null,
      type: null,
    });

    const filteredQuestions = useMemo(() => {
      return sampleQuestions.filter((q) => {
        if (filters.company && q.company !== filters.company) return false;
        if (filters.industry && q.industry !== filters.industry) return false;
        if (filters.type && q.type !== filters.type) return false;
        return true;
      });
    }, [filters]);

    const paginatedQuestions = useMemo(() => {
      const start = (page - 1) * pageSize;
      return filteredQuestions.slice(start, start + pageSize);
    }, [filteredQuestions, page, pageSize]);

    const pagination: QuestionTablePagination = {
      page,
      pageSize,
      totalItems: filteredQuestions.length,
      totalPages: Math.ceil(filteredQuestions.length / pageSize),
    };

    return (
      <div className="p-8 bg-zinc-950 min-h-screen">
        <QuestionTable
          questions={paginatedQuestions}
          onQuestionClick={(q) => console.log("Clicked:", q.text)}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          variant="dark"
          layout="full-context"
        />
      </div>
    );
  },
  parameters: {
    backgrounds: { default: "darker" },
  },
};

export const Loading: Story = {
  render: () => (
    <div className="p-8 bg-stone-100 min-h-screen">
      <QuestionTable
        questions={[]}
        onQuestionClick={(q) => console.log("Clicked:", q.text)}
        isLoading={true}
        layout="full-context"
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-8 bg-stone-100 min-h-screen">
      <QuestionTable
        questions={[]}
        onQuestionClick={(q) => console.log("Clicked:", q.text)}
        layout="full-context"
      />
    </div>
  ),
};

export const FilteredEmpty: Story = {
  render: function Render() {
    const [filters, setFilters] = useState<QuestionTableFilters>({
      company: "NonExistent",
      industry: null,
      type: null,
    });

    return (
      <div className="p-8 bg-stone-100 min-h-screen">
        <QuestionTable
          questions={[]}
          onQuestionClick={(q) => console.log("Clicked:", q.text)}
          filters={filters}
          onFiltersChange={setFilters}
          companies={["McKinsey", "BCG", "Bain"]}
          industries={["Technology", "Healthcare"]}
          types={["Strategy", "Operations"]}
          layout="full-context"
        />
      </div>
    );
  },
};

export const FewItems: Story = {
  render: () => (
    <div className="p-8 bg-stone-100 min-h-screen">
      <QuestionTable
        questions={sampleQuestions.slice(0, 3)}
        onQuestionClick={(q) => console.log("Clicked:", q.text)}
        layout="full-context"
      />
    </div>
  ),
};
