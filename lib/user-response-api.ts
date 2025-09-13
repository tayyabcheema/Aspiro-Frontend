import { getApiUrl } from './api-config';

export interface UserResponse {
  questionId: string;
  answerText?: string;
  answerChoice?: string;  // Used for both multiple-choice and yes/no questions
  answerLink?: string;
  files?: Array<{
    file: string;
    type: string;
  }>;
}

export interface SaveUserResponseRequest {
  responses: UserResponse[];
  files?: File[];
}

export interface SaveUserResponseResponse {
  success: boolean;
  message: string;
  data?: any[];
  cleanup?: {
    filesDeleted: number;
    cleanupErrors: number;
  };
}

export async function saveUserResponses(
  responses: UserResponse[],
  files: File[],
  token: string
): Promise<SaveUserResponseResponse> {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add responses as JSON string
    formData.append('responses', JSON.stringify(responses));
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });


    const response = await fetch(getApiUrl('/user-response/save'), {
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

    const data: SaveUserResponseResponse = await response.json();
    

    return data;
  } catch (error) {
    console.error('Error saving user responses:', error);
    throw error;
  }
}
