import React from "react";

interface QuestionCardProps {
  question: Question;
  onClick: (question: Question) => void;
  isSelected?: boolean;
}

export interface Question {
  id: string;
  text: string;
  company: string;
  logoUrl: string;
}

export interface AnswerState {
  questionId: string | null;
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

export const InterviewQuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onClick,
  isSelected,
}) => {
  return (
    <div
      onClick={() => onClick(question)}
      className={`
        group relative flex flex-col justify-between
        w-full max-w-[320px] h-[320px] p-8
        bg-white rounded-[32px] 
        transition-all duration-300 ease-out cursor-pointer
        ${
          isSelected
            ? "ring-2 ring-blue-500 shadow-xl scale-[1.02]"
            : "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
        }
        border border-transparent hover:border-gray-100
      `}
    >
      {/* Question Text */}
      <div className="flex-grow">
        <h3 className="text-3xl font-semibold text-gray-800 leading-tight tracking-tight">
          {question.text}
        </h3>
      </div>

      {/* Footer: Logo and Company Name */}
      <div className="flex items-center gap-4 mt-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors shrink-0">
          <img
            src={question.logoUrl}
            alt={`${question.company} logo`}
            className="w-full h-full object-contain p-3"
            onError={(e) => {
              // Fallback if image fails
              (e.target as HTMLImageElement).src =
                "https://picsum.photos/64/64";
            }}
          />
        </div>
        <span className="text-xl font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
          {question.company}
        </span>
      </div>

      {/* Decorative hover gradient overlay (subtle) */}
      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:to-transparent pointer-events-none transition-all duration-500" />
    </div>
  );
};
