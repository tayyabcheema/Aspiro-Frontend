export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validators = {
  required: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: "This field is required" }
    }
    return { isValid: true }
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { isValid: false, error: "Please enter a valid email address" }
    }
    return { isValid: true }
  },

  password: (value: string): ValidationResult => {
    if (value.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long" }
    }
    return { isValid: true }
  },

  confirmPassword: (password: string, confirmPassword: string): ValidationResult => {
    if (password !== confirmPassword) {
      return { isValid: false, error: "Passwords do not match" }
    }
    return { isValid: true }
  },

  fileType: (file: File, allowedTypes: string[]): ValidationResult => {
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: `File type not supported. Allowed types: ${allowedTypes.join(", ")}` }
    }
    return { isValid: true }
  },

  fileSize: (file: File, maxSizeInMB: number): ValidationResult => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return { isValid: false, error: `File size must be less than ${maxSizeInMB}MB` }
    }
    return { isValid: true }
  },

  minLength: (value: string, minLength: number): ValidationResult => {
    if (value.length < minLength) {
      return { isValid: false, error: `Must be at least ${minLength} characters long` }
    }
    return { isValid: true }
  },

  maxLength: (value: string, maxLength: number): ValidationResult => {
    if (value.length > maxLength) {
      return { isValid: false, error: `Must be no more than ${maxLength} characters long` }
    }
    return { isValid: true }
  },
}

export function validateField(value: string, validations: Array<(value: string) => ValidationResult>): ValidationResult {
  for (const validation of validations) {
    const result = validation(value)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}
