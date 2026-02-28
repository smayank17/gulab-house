import React from "react";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-saffron-300 ${
        props.className || ""
      }`}
    />
  );
}