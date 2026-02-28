import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition shadow-soft";
  const variants = {
    primary: "bg-maroon-700 text-white hover:bg-maroon-800",
    secondary: "bg-white text-maroon-800 border border-maroon-200 hover:bg-maroon-50 shadow-none",
    ghost: "bg-transparent text-maroon-800 hover:bg-maroon-50 shadow-none"
  }[variant];

  return <button className={`${base} ${variants} ${className}`} {...props} />;
}