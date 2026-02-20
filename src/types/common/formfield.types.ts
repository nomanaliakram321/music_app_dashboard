import { LucideIcon } from "lucide-react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  icon: LucideIcon;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  id: string;
}
export type { FormFieldProps };