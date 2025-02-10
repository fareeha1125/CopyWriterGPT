import React from "react";
import { Utensils, Carrot, Clock, ShoppingCart, Dumbbell, Apple, HeartPulse, CalendarCheck, PenTool, MessageCircle, FileText, BookOpen } from "lucide-react";

// Define the props interface
interface QuickStartCardsProps {
  onQuestionSelect: (question: string) => void;
}

// Define the question item interface
interface QuestionItem {
  icon: React.ReactNode;
  text: string;
  question: string;
}

const QuickStartCards: React.FC<QuickStartCardsProps> = ({
  onQuestionSelect,
}) => {
  const questions = [
    {
      icon: <PenTool className="w-5 h-5" />,
      text: "Website Copy",
      question: "Can you help me write compelling website copy? My business focuses on [please specify your industry and target audience].",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      text: "Social Media Captions",
      question: "I need engaging social media captions for my posts about [mention topic or product]. Can you provide some creative options?",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      text: "Email Marketing",
      question: "Can you draft a high-converting email for my campaign? The goal is [e.g., lead generation, sales, engagement].",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      text: "Blog Content",
      question: "I need a blog post on [mention topic]. Can you help structure and write an engaging piece?",
    },
  ];
  
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full p-4">
      {questions.map((item, index) => (
        <button
          key={index}
          onClick={() => onQuestionSelect(item.question)}
          className="bg-white dark:bg-black p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center space-y-3 border border-black/10 dark:border-white/10"
        >
          <div className="text-black dark:text-white">{item.icon}</div>
          <span className="text-sm text-black dark:text-white">
            {item.text}
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuickStartCards;
