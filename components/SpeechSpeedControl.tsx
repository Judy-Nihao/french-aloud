type SpeechSpeedControlProps = {
  value: number;
  disabled?: boolean;
  onChange: (speed: number) => void;
};

const minSpeed = 0.7;
const maxSpeed = 1.2;
const speedStep = 0.05;

export const SpeechSpeedControl = ({
  value,
  disabled = false,
  onChange,
}: SpeechSpeedControlProps) => {
  return (
    <fieldset className="mt-8 rounded-control border border-control-border bg-control-surface px-4 py-4 sm:px-5">
      <legend className="sr-only">Playback speed</legend>
      <div className="flex items-center justify-between gap-4">
        <label
          className="text-sm font-medium text-control-strong"
          htmlFor="playback-speed"
        >
          Playback speed
        </label>
        <output
          className="min-w-14 rounded-md bg-control-soft px-2 py-1 text-center text-sm font-medium text-ink tabular-nums"
          htmlFor="playback-speed"
        >
          {formatSpeed(value)}
        </output>
      </div>

      <input
        id="playback-speed"
        className="mt-4 h-6 w-full cursor-pointer rounded-full accent-control-strong focus-visible:ring-2 focus-visible:ring-control-focus focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
        className="relative mt-1 h-4 text-xs text-control-muted"
        aria-hidden="true"
      >
        <span className="absolute left-0">0.7×</span>
        <span className="absolute left-[60%] -translate-x-1/2">1× normal</span>
        <span className="absolute right-0">1.2×</span>
      </div>
    </fieldset>
  );
};

const formatSpeed = (speed: number) =>
  `${speed.toFixed(2).replace(/\.00$/, "")}×`;
