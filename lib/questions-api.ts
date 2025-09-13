interface Question {
  _id: string;
  text: string;
  type: "text" | "yes/no" | "multiple-choice" | "upload" | "link";
  options: string[];
  step: {
    stepNumber: number;
    stepName: string;
  };
  category: "student" | "professional";
  optional: boolean;
  status: "active" | "inactive";
  documents: {
    cv: boolean;
    optionalDocs: Array<{
      type: string;
      required: boolean;
    }>;
  };
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionsResponse {
  success: boolean;
  count: number;
  data: Question[];
}

import { getApiUrl } from './api-config';

export async function fetchQuestions(token: string): Promise<Question[]> {
  try {
    const response = await fetch(getApiUrl('/questions/all'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
    }

    const data: QuestionsResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch questions from server');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export interface AddQuestionRequest {
  text: string;
  type: "text" | "yes/no" | "multiple-choice" | "upload" | "link";
  options?: string[];
  step: {
    stepNumber: number;
    stepName: string;
  };
  category: "student" | "professional";
  optional?: boolean;
  status?: "active" | "inactive";
  documents?: {
    cv: boolean;
    optionalDocs: Array<{
      type: string;
      required: boolean;
    }>;
  };
}

export interface AddQuestionsResponse {
  message: string;
  data: Question[];
}

export async function addQuestion(question: AddQuestionRequest, token: string): Promise<AddQuestionsResponse> {
  try {
    const response = await fetch(getApiUrl('/questions/add'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([question]), // Wrap single question in array as per API
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add question: ${response.status} ${response.statusText}`);
    }

    const data: AddQuestionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
}

export async function addMultipleQuestions(questions: AddQuestionRequest[], token: string): Promise<AddQuestionsResponse> {
  try {
    const response = await fetch(getApiUrl('/questions/add'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questions),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add questions: ${response.status} ${response.statusText}`);
    }

    const data: AddQuestionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding questions:', error);
    throw error;
  }
}

export interface UpdateQuestionRequest {
  text: string;
  type: "text" | "yes/no" | "multiple-choice" | "upload" | "link";
  options?: string[];
  step: {
    stepNumber: number;
    stepName: string;
  };
  category: "student" | "professional";
  optional?: boolean;
  status?: "active" | "inactive";
  documents?: {
    cv: boolean;
    optionalDocs: Array<{
      type: string;
      required: boolean;
    }>;
  };
}

export interface UpdateQuestionResponse {
  message: string;
  data: Question;
}

export interface DeleteQuestionResponse {
  message: string;
}

export async function updateQuestion(id: string, question: UpdateQuestionRequest, token: string): Promise<UpdateQuestionResponse> {
  try {
    const response = await fetch(getApiUrl(`/questions/${id}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update question: ${response.status} ${response.statusText}`);
    }

    const data: UpdateQuestionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

export async function deleteQuestion(id: string, token: string): Promise<DeleteQuestionResponse> {
  try {
    const response = await fetch(getApiUrl(`/questions/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete question: ${response.status} ${response.statusText}`);
    }

    const data: DeleteQuestionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}

export type { Question, AddQuestionRequest, AddQuestionsResponse, UpdateQuestionRequest, UpdateQuestionResponse, DeleteQuestionResponse };
