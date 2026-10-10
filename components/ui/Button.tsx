import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "quiet" | "icon" | "pill";
};

const variants = {
  quiet:
    "min-h-11 transition-colors rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-hover disabled:opacity-40",
  icon: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-strong",
  pill: "inline-flex min-h-11 items-center justify-center rounded-full border border-border-control bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap text-secondary transition-colors hover:border-border-active hover:bg-hover hover:text-strong focus-visible:ring-offset-2",
};

/** Layout belongs to the caller; shared interaction styles belong here. */
export function Button({
  variant = "quiet",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none disabled:cursor-not-allowed motion-reduce:transition-none ${variants[variant]} ${className}`}
    />
  );
}
