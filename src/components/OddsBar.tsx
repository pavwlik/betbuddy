'use client';

export default function OddsBar({
  label,
  odds,
  votePercentage,
  onBet,
  disabled,
}: {
  label: string;
  odds: number;
  votePercentage?: number;
  onBet?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onBet}
      disabled={disabled}
      className="relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-neutral-800 bg-panel2 px-4 py-3 text-left transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {typeof votePercentage === 'number' && (
        <div
          className="absolute inset-y-0 left-0 bg-accent/10"
          style={{ width: `${votePercentage}%` }}
        />
      )}
      <span className="relative z-10 font-medium">{label}</span>
      <span className="relative z-10 rounded-md bg-black px-3 py-1 font-bold text-accent">
        {odds.toFixed(2)}
      </span>
    </button>
  );
}
