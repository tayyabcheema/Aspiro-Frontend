import { getApiUrl } from './api-config';

export interface CVUploadResponse {
  success: boolean;
  message: string;
  data: {
    autoFilled: Record<string, string>;
    aiSuggestions: Record<string, string[]>;
    extractedData: {
      skills: string[];
      education: Array<{
        degree: string;
        institution: string;
        raw: string;
      }>;
      experience: Array<{
        role: string;
        company: string;
        raw: string;
      }>;
      certifications: string[];
      totalExperience: string | null;
      contactInfo: Record<string, string>;
    };
    processedQuestions: number;
    aiLogsCount: number;
  };
}

export interface CVSuggestionsResponse {
  success: boolean;
  data: {
    autoFilled: Record<string, string>;
    aiSuggestions: Record<string, string[]>;
  };
}

/**
 * Upload CV file and get auto-filled answers and AI suggestions
 */
export async function uploadCV(file: File, token: string): Promise<CVUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await fetch(getApiUrl('/cv/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to upload CV: ${response.status} ${response.statusText}`);
    }

    const data: CVUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading CV:', error);
    throw error;
  }
}

/**
 * Get existing CV suggestions for the user
 */
export async function getCVSuggestions(token: string): Promise<CVSuggestionsResponse> {
  try {
    const response = await fetch(getApiUrl('/cv/suggestions'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get CV suggestions: ${response.status} ${response.statusText}`);
    }

    const data: CVSuggestionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting CV suggestions:', error);
    throw error;
  }
}

/**
 * Get CV suggestions from user response API (alternative endpoint)
 */
export async function getCVSuggestionsFromResponses(token: string): Promise<CVSuggestionsResponse> {
  try {
    const response = await fetch(getApiUrl('/user-response/cv-suggestions'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get CV suggestions: ${response.status} ${response.statusText}`);
    }

    const data: CVSuggestionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting CV suggestions from responses:', error);
    throw error;
  }
}

export type { CVUploadResponse, CVSuggestionsResponse };
