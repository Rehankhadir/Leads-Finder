import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const keywordSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
})

export const savedSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required'),
  description: z.string().optional(),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  sources: z.array(z.string()).min(1, 'At least one source is required'),
  location: z.string().optional(),
  is_active: z.boolean().default(true),
})

export const manualLeadSchema = z.object({
  source_url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
  content: z.string().min(1, 'Post content is required'),
  author_name: z.string().optional(),
  business_name: z.string().optional(),
  location: z.string().optional(),
})

export const noteSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty'),
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
})

export const discoverySchema = z.object({
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  sources: z.array(z.string()).min(1, 'At least one source is required'),
  location: z.string().optional(),
  dateRange: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type KeywordFormData = z.infer<typeof keywordSchema>
export type SavedSearchFormData = z.infer<typeof savedSearchSchema>
export type ManualLeadFormData = z.infer<typeof manualLeadSchema>
export type NoteFormData = z.infer<typeof noteSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type WorkspaceFormData = z.infer<typeof workspaceSchema>
export type DiscoveryFormData = z.infer<typeof discoverySchema>
