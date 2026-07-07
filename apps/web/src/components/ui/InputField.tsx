import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes } from "react";

const inputField = cva(
  "w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors disabled:opacity-50",
  {
    variants: {
      state: {
        default: "border-gray-700 focus:border-brand",
        error: "border-red-800/60 focus:border-red-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputField> {
  /** Field-level error message; also switches the border to the error state. */
  error?: string;
}

export function InputField({ error, state, className, ...inputProps }: InputFieldProps) {
  return (
    <>
      <input
        {...inputProps}
        className={inputField({ state: error ? "error" : state, className })}
      />
      {error && <p className="text-red-400 text-sm mt-1.5">{error}</p>}
    </>
  );
}
