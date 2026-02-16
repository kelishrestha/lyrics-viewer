import "../styles/Progress.css";

const ProgressBar = ({
  value,
  onChange,
  progressSeekStart,
  progressSeekEnd,
  timeElapsed,
  songLength,
  isDisabled
}: {
  value: number;
  onChange: (e: any) => void;
  progressSeekStart: () => void;
  progressSeekEnd: (e: any) => void;
  timeElapsed: string;
  songLength: string;
  isDisabled: boolean;
}) => {
  return (
    <div className="progress">
      <input
        type="range"
        aria-label="Progress slider"
        value={value}
        min="0"
        max="100"
        className="progress__slider"
        onChange={onChange}
        style={{
          background: `linear-gradient(90deg, ${isDisabled ? 'var(--color-primary-inactive)' : 'var(--color-primary)'} ${Math.ceil(
            value
          )}%, transparent ${Math.ceil(value)}%)`,
        }}
        onTouchStart={progressSeekStart}
        onMouseDown={progressSeekStart}
        onTouchEnd={progressSeekEnd}
        onClick={progressSeekEnd}
        disabled={isDisabled}
      />
      <div className="progress__time" style={{ color: isDisabled ? 'var(--color-primary-inactive)' : 'var(--color-primary)' }}>
        <span className="progress__timeElapsed">{timeElapsed}</span>
        <span className="progress__timeLength">{songLength}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
