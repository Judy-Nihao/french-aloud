export type ReadingMode = "clear" | "natural" | "expressive";

type ReadingModeControlProps = {
  value: ReadingMode;
  disabled?: boolean;
  onChange: (mode: ReadingMode) => void;
};

const readingModes: Array<{
  value: ReadingMode;
  label: string;
  description: string;
}> = [
  {
    value: "clear",
    label: "Clear",
    description: "Steady and easy to follow",
  },
  {
    value: "natural",
    label: "Natural",
    description: "Balanced and conversational",
  },
  {
    value: "expressive",
    label: "Expressive",
    description: "More lively and varied",
  },
];

export const ReadingModeControl = ({
  value,
  disabled = false,
  onChange,
}: ReadingModeControlProps) => {
  return (
    <fieldset className="mt-5 rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-4 sm:px-5">
      <legend className="px-1 text-sm font-semibold text-stone-800">
        Reading mode
      </legend>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {readingModes.map((mode) => {
          const isSelected = mode.value === value;

          return (
            <label
              key={mode.value}
              className={`cursor-pointer rounded-lg border px-3 py-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-stone-500 focus-within:ring-offset-2 ${
                isSelected
                  ? "border-stone-700 bg-stone-800 text-stone-50"
                  : "border-stone-300 bg-stone-50 text-stone-800 hover:bg-stone-100"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="reading-mode"
                value={mode.value}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange(mode.value)}
              />
              <span className="block text-sm font-semibold">{mode.label}</span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  isSelected ? "text-stone-300" : "text-stone-500"
                }`}
              >
                {mode.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
