import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock authentication - Replace with actual API calls later
export const mockLogin = async (email: string, password: string, role: 'student' | 'mentor') => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  return {
    id: '1',
    email,
    name: email.split('@')[0],
    role,
  };
};
