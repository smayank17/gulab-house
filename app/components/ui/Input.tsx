import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-saffron-300 ${
        props.className || ""
      }`}
    />
  );
}