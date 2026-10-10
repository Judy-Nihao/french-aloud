import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "quiet" | "icon" | "icon-circle" | "pill" | "tab";
};

const variants = {
  quiet:
    "min-h-11 transition-colors rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-hover disabled:opacity-40",
  icon: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-strong",
  "icon-circle":
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-control bg-surface text-secondary shadow-control transition-colors hover:border-border-active hover:bg-hover hover:text-strong",
  tab: "group relative inline-flex min-h-11 items-center justify-center px-10 py-2 text-sm font-medium whitespace-nowrap text-ink focus-visible:ring-offset-2",
  pill: "inline-flex min-h-11 items-center justify-center rounded-full border border-border-control bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap text-secondary transition-colors hover:border-border-active hover:bg-hover hover:text-strong focus-visible:ring-offset-2",
};

/** Layout belongs to the caller; shared interaction styles belong here. */
export function Button({
  variant = "quiet",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none disabled:cursor-not-allowed motion-reduce:transition-none ${variants[variant]} ${className}`}
    >
      {variant === "tab" ? (
        <>
          {/* Cover the panel border beneath the tab; its stroke shares the border centerline. */}
          <span
            className="pointer-events-none absolute inset-x-0 -bottom-[0.5px] h-px bg-surface"
            aria-hidden="true"
          />
          <svg
            className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
            viewBox="0 0 260 44"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 44 C38 44 26 0 52 0 H208 C234 0 222 44 260 44 Z"
              className="fill-tab transition-opacity group-hover:opacity-80 motion-reduce:transition-none"
            />
            <path
              d="M0 44 C38 44 26 0 52 0 H208 C234 0 222 44 260 44"
              className="fill-none stroke-border"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="relative z-20">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
