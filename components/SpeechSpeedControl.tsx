type SpeechSpeedControlProps = {
  value: number;
  disabled?: boolean;
  onChange: (speed: number) => void;
};

const minSpeed = 0.5;
const maxSpeed = 2;
const speedStep = 0.05;

export const SpeechSpeedControl = ({
  value,
  disabled = false,
  onChange,
}: SpeechSpeedControlProps) => {
  return (
    <fieldset className="mt-8 rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-4 sm:px-5">
      <legend className="sr-only">Reading speed</legend>
      <div className="flex items-center justify-between gap-4">
        <label
          className="text-sm font-semibold text-stone-800"
          htmlFor="reading-speed"
        >
          Reading speed
        </label>
        <output
          className="min-w-14 rounded-md bg-stone-200 px-2 py-1 text-center text-sm font-semibold text-stone-700 tabular-nums"
          htmlFor="reading-speed"
        >
          {formatSpeed(value)}
        </output>
      </div>

      <input
        id="reading-speed"
        className="mt-4 h-6 w-full cursor-pointer rounded-full accent-stone-800 focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        type="range"
        min={minSpeed}
        max={maxSpeed}
        step={speedStep}
        value={value}
        disabled={disabled}
        aria-valuetext={formatSpeed(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      <div
        className="relative mt-1 h-4 text-xs text-stone-500"
        aria-hidden="true"
      >
        <span className="absolute left-0">0.5×</span>
        <span className="absolute left-1/3 -translate-x-1/2">1× normal</span>
        <span className="absolute right-0">2×</span>
      </div>
    </fieldset>
  );
};

const formatSpeed = (speed: number) =>
  `${speed.toFixed(2).replace(/\.00$/, "")}×`;
