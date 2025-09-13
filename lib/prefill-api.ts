import { getApiUrl } from './api-config';

export interface PreFillRequest {
  files: File[];
}

export interface PreFillResponse {
  success: boolean;
  message: string;
  data?: {
    preFilledAnswers: Record<string, PreFillAnswer>;
    questionMappings: {
      autoFill: QuestionMapping[];
      aiSuggestions: QuestionMapping[];
      noMatch: QuestionMapping[];
    };
    documentSummary: DocumentSummary;
    summary: ProcessingSummary;
  };
  metadata?: {
    processedAt: string;
    documentsProcessed: number;
    questionsProcessed: number;
    autoFillCount: number;
    aiSuggestionsCount: number;
    noMatchCount: number;
  };
}

export interface PreFillAnswer {
  type: 'auto-fill' | 'ai-suggestions';
  answer?: string;
  suggestions?: string[];
  confidence: number;
  source: string;
  metadata: {
    questionType: string;
    questionText: string;
    generatedAt: string;
    aiMetadata?: any;
  };
  error?: string;
}

export interface QuestionMapping {
  questionId: string;
  questionText: string;
  questionType: string;
  confidence?: number;
  hasAnswer?: boolean;
  suggestionCount?: number;
}

export interface DocumentSummary {
  personalInfo: Record<string, string>;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  certifications: CertificationEntry[];
  languages: string[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
  contactInfo: Record<string, string>;
  objective: string;
  summary: string;
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
}

export interface AchievementEntry {
  title: string;
  description: string;
}

export interface ProcessingSummary {
  success: boolean;
  totalQuestions: number;
  autoFillQuestions: number;
  aiSuggestionQuestions: number;
  noMatchQuestions: number;
  autoFillSuccessRate: number;
  aiSuggestionSuccessRate: number;
  details: {
    autoFill: Array<{
      questionId: string;
      questionText: string;
      confidence: number;
      hasAnswer: boolean;
    }>;
    aiSuggestions: Array<{
      questionId: string;
      questionText: string;
      hasAnswer: boolean;
    }>;
    noMatch: Array<{
      questionId: string;
      questionText: string;
    }>;
  };
}

/**
 * Pre-fill questions based on uploaded documents
 * @param files - Array of uploaded files
 * @param token - Authentication token
 * @returns Promise<PreFillResponse>
 */
export async function preFillQuestions(
  files: File[],
  token: string
): Promise<PreFillResponse> {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided for pre-filling');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });


    const response = await fetch(getApiUrl('/user-response/prefill'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: PreFillResponse = await response.json();
    

    return data;
  } catch (error) {
    console.error('Error pre-filling questions:', error);
    throw error;
  }
}

/**
 * Apply pre-filled answers to form data
 * @param preFilledAnswers - Pre-filled answers from API
 * @param questions - Questions array
 * @returns Record<string, any> - Updated form data
 */
export function applyPreFilledAnswers(
  preFilledAnswers: Record<string, PreFillAnswer>,
  questions: any[]
): Record<string, any> {
  const formData: Record<string, any> = {};
  
  Object.entries(preFilledAnswers).forEach(([questionId, preFillAnswer]) => {
    
    // Handle both _id (from backend) and id (from onboarding steps)
    const question = questions.find(q => q._id === questionId || q.id === questionId);
    if (!question) {
      return;
    }

    // Use the correct ID field for form data (id for onboarding steps, _id for questions)
    const formDataKey = question.id || questionId;
    
    switch (preFillAnswer.type) {
      case 'auto-fill':
        if (preFillAnswer.answer) {
          // For auto-fill, directly use the answer
          formData[formDataKey] = preFillAnswer.answer;
        }
        break;
        
      case 'ai-suggestions':
        // For AI suggestions, use the direct answer
        if (preFillAnswer.answer) {
          formData[formDataKey] = preFillAnswer.answer;
        }
        // Store the answer for potential display
        formData[`${formDataKey}_aiAnswer`] = preFillAnswer.answer || '';
        break;
    }
  });

  return formData;
}

/**
 * Get confidence level description
 * @param confidence - Confidence score (0-1)
 * @returns string - Confidence description
 */
export function getConfidenceDescription(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
}

/**
 * Get confidence color for UI
 * @param confidence - Confidence score (0-1)
 * @returns string - CSS color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-400';
  if (confidence >= 0.7) return 'text-green-300';
  if (confidence >= 0.5) return 'text-yellow-300';
  if (confidence >= 0.3) return 'text-orange-300';
  return 'text-red-300';
}
