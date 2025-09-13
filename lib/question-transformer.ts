import { Question } from './questions-api';
import { 
  GraduationCap, 
  Target, 
  Zap, 
  BookOpen, 
  Clock, 
  Briefcase, 
  Heart, 
  Users, 
  Upload,
  Brain,
  Link
} from "lucide-react";

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  type: "text" | "textarea" | "select" | "multiselect" | "file" | "checkbox" | "completion";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  fileTypes?: string[];
  maxFiles?: number;
  stepNumber: number;
  stepName: string;
  category: "student" | "professional";
}

// Icon mapping based on step names
const getStepIcon = (stepName: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    "Academic Background": GraduationCap,
    "Career Aspirations": Target,
    "Skills & Strengths": Zap,
    "Learning & Development Preferences": BookOpen,
    "Timeline & Goals": Clock,
    "Work Preferences": Briefcase,
    "Career Motivation": Heart,
    "Career Challenges & Barriers": Heart,
    "Networking & Professional Exposure": Users,
    "Professional Profiles & Documents": Upload,
  };
  
  return iconMap[stepName] || Brain;
};

// Map backend question types to frontend types
const mapQuestionType = (backendType: string): OnboardingStep['type'] => {
  switch (backendType) {
    case "text":
      return "text";
    case "yes/no":
      return "select";
    case "multiple-choice":
      return "select";
    case "upload":
      return "file";
    case "link":
      return "text";
    default:
      return "text";
  }
};

// Generate placeholder text based on question type and text
const generatePlaceholder = (question: Question): string => {
  const text = question.text.toLowerCase();
  
  if (question.type === "text") {
    if (text.includes("major") || text.includes("field of study")) {
      return "e.g., Computer Science, Business Administration, Engineering";
    }
    if (text.includes("dream job") || text.includes("role")) {
      return "e.g., Software Engineer, Data Scientist, Product Manager";
    }
    if (text.includes("skills")) {
      return "e.g., Programming, Communication, Problem-solving, Leadership...";
    }
    if (text.includes("goal")) {
      return "e.g., Get my first job in tech, Complete a certification, Build a portfolio...";
    }
    if (text.includes("challenge")) {
      return "Describe any challenges you face...";
    }
    if (text.includes("link") || text.includes("portfolio")) {
      return "https://github.com/username, https://linkedin.com/in/username";
    }
    return "Enter your answer...";
  }
  
  return "";
};

// Generate subtitle based on question text
const generateSubtitle = (question: Question): string => {
  const text = question.text.toLowerCase();
  
  if (text.includes("level of study")) {
    return "This helps us understand your educational context";
  }
  if (text.includes("major") || text.includes("field of study")) {
    return "Tell us about your academic focus";
  }
  if (text.includes("subjects") || text.includes("courses")) {
    return "This helps us identify your interests and strengths";
  }
  if (text.includes("continue") || text.includes("studies")) {
    return "e.g., master's, PhD, or other advanced degrees";
  }
  if (text.includes("dream job") || text.includes("role")) {
    return "Be specific about the position you aspire to";
  }
  if (text.includes("industries") || text.includes("fields")) {
    return "Select all that apply";
  }
  if (text.includes("career path")) {
    return "Choose the path that best describes your interests";
  }
  if (text.includes("entrepreneurship") || text.includes("business")) {
    return "This helps us understand your long-term goals";
  }
  if (text.includes("confident") || text.includes("skills")) {
    return "List the skills you're good at or have experience with";
  }
  if (text.includes("develop") || text.includes("further")) {
    return "Identify areas for growth and improvement";
  }
  if (text.includes("projects") || text.includes("internships")) {
    return "Tell us about your practical experience";
  }
  if (text.includes("learn") || text.includes("prefer")) {
    return "Select all that apply";
  }
  if (text.includes("time") || text.includes("dedicate")) {
    return "Be realistic about your availability";
  }
  if (text.includes("extracurricular") || text.includes("clubs")) {
    return "This helps us suggest relevant opportunities";
  }
  if (text.includes("graduate") || text.includes("graduation")) {
    return "This helps us plan your career timeline";
  }
  if (text.includes("work") || text.includes("immediately")) {
    return "Yes/No";
  }
  if (text.includes("short-term") || text.includes("1–2 years")) {
    return "Be specific about what you want to achieve";
  }
  if (text.includes("long-term") || text.includes("5–10 years")) {
    return "Think about where you want to be in your career";
  }
  if (text.includes("internship") || text.includes("part-time")) {
    return "This helps us suggest relevant opportunities";
  }
  if (text.includes("on-site") || text.includes("remote") || text.includes("hybrid")) {
    return "Select your preferred work arrangement";
  }
  if (text.includes("motivate") || text.includes("career journey")) {
    return "Choose the factor that drives you";
  }
  if (text.includes("cv") || text.includes("exploring")) {
    return "This helps us prioritize your next steps";
  }
  if (text.includes("challenge") || text.includes("face")) {
    return "Select all that apply";
  }
  if (text.includes("setback") || text.includes("academic")) {
    return "This helps us understand your background better";
  }
  if (text.includes("personal") || text.includes("logistical")) {
    return "This helps us provide more personalized guidance";
  }
  if (text.includes("linkedin") || text.includes("professional platforms")) {
    return "This helps us understand your online presence";
  }
  if (text.includes("mentorship") || text.includes("coaching")) {
    return "This helps us suggest relevant programs";
  }
  if (text.includes("portfolio") || text.includes("cv")) {
    return "This helps us provide relevant resources";
  }
  if (text.includes("upload") || text.includes("cv/resume")) {
    return "This helps us analyze your current profile";
  }
  if (text.includes("transcript") || text.includes("mark sheets")) {
    return "This helps us understand your academic background";
  }
  if (text.includes("portfolio") || text.includes("github")) {
    return "This helps us understand your work";
  }
  if (text.includes("linkedin") || text.includes("profile")) {
    return "This helps us connect with your professional network";
  }
  if (text.includes("permission") || text.includes("analyze")) {
    return "We'll use AI to analyze your information and create a tailored career roadmap";
  }
  
  return "";
};

// Generate file types based on question text
const generateFileTypes = (question: Question): string[] => {
  const text = question.text.toLowerCase();
  
  if (text.includes("cv") || text.includes("resume")) {
    return [".pdf", ".doc", ".docx"];
  }
  if (text.includes("transcript") || text.includes("mark sheets")) {
    return [".pdf", ".jpg", ".png"];
  }
  if (text.includes("document") || text.includes("certificate")) {
    return [".pdf", ".doc", ".docx", ".jpg", ".png"];
  }
  
  return [".pdf", ".doc", ".docx", ".jpg", ".png"];
};

// Generate max files based on question text
const generateMaxFiles = (question: Question): number => {
  const text = question.text.toLowerCase();
  
  if (text.includes("cv") || text.includes("resume")) {
    return 1;
  }
  if (text.includes("transcript") || text.includes("mark sheets")) {
    return 5;
  }
  if (text.includes("document") || text.includes("certificate")) {
    return 3;
  }
  
  return 1;
};

export function transformQuestionsToSteps(questions: Question[]): OnboardingStep[] {
  // Sort questions with specific priority: User type first, then CV upload, then others
  const sortedQuestions = questions
    .filter(q => q.status === "active")
    .sort((a, b) => {
      // Check if questions are user type questions
      const aIsUserType = a.text.toLowerCase().includes('student') && 
                          a.text.toLowerCase().includes('professional');
      const bIsUserType = b.text.toLowerCase().includes('student') && 
                          b.text.toLowerCase().includes('professional');
      
      // Check if questions are CV upload questions (main CV, not optional documents)
      const aIsCV = a.type === "upload" && (
        a.text.toLowerCase().includes('most recent cv') ||
        a.text.toLowerCase().includes('please upload your most recent') ||
        (a.text.toLowerCase().includes('cv') && a.text.toLowerCase().includes('pdf') && !a.text.toLowerCase().includes('optional')) ||
        (a.text.toLowerCase().includes('resume') && a.text.toLowerCase().includes('pdf') && !a.text.toLowerCase().includes('optional'))
      );
      const bIsCV = b.type === "upload" && (
        b.text.toLowerCase().includes('most recent cv') ||
        b.text.toLowerCase().includes('please upload your most recent') ||
        (b.text.toLowerCase().includes('cv') && b.text.toLowerCase().includes('pdf') && !b.text.toLowerCase().includes('optional')) ||
        (b.text.toLowerCase().includes('resume') && b.text.toLowerCase().includes('pdf') && !b.text.toLowerCase().includes('optional'))
      );
      
      // User type questions go first
      if (aIsUserType && !bIsUserType) return -1;
      if (!aIsUserType && bIsUserType) return 1;
      
      // CV upload questions go second
      if (aIsCV && !bIsCV && !aIsUserType && !bIsUserType) return -1;
      if (!aIsCV && bIsCV && !aIsUserType && !bIsUserType) return 1;
      
      // Then sort by step number and creation date
      if (a.step.stepNumber !== b.step.stepNumber) {
        return a.step.stepNumber - b.step.stepNumber;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });


  const steps: OnboardingStep[] = sortedQuestions.map((question, index) => {
    const stepType = mapQuestionType(question.type);
    
    const step = {
      id: question._id,
      title: question.text,
      subtitle: generateSubtitle(question),
      icon: getStepIcon(question.step.stepName),
      type: stepType,
      options: question.type === "multiple-choice" ? 
               (question.options && question.options.length > 0 && 
                question.options[0].includes(' ') && 
                question.text.toLowerCase().includes('student') && 
                question.text.toLowerCase().includes('professional') ? 
                ["Student", "Professional"] : question.options) : 
               question.type === "yes/no" ? ["Yes", "No"] : undefined,
      placeholder: generatePlaceholder(question),
      required: !question.optional,
      fileTypes: question.type === "upload" ? generateFileTypes(question) : undefined,
      maxFiles: question.type === "upload" ? generateMaxFiles(question) : undefined,
      stepNumber: question.step.stepNumber,
      stepName: question.step.stepName,
      category: question.category,
    };
    
    
    return step;
  });

  // Add completion step at the end
  steps.push({
    id: "completion",
    title: "Analyzing your profile with AI",
    subtitle: "Please wait while we process your information and generate your personalized career plan...",
    icon: Brain,
    type: "completion",
    stepNumber: 999,
    stepName: "Completion",
    category: "student",
  });

  return steps;
}
