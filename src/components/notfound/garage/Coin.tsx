/** The 404 games' coin: gold, with the flag's checker in the middle. */
export default function Coin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="10" cy="10" r="9.25" fill="#F5B83D" />
      <circle cx="10" cy="10" r="7" fill="none" stroke="#D99A1E" strokeWidth="1.4" />
      <path d="M7 7h2v2H7zM11 7h2v2h-2zM9 9h2v2H9zM7 11h2v2H7zM11 11h2v2h-2z" fill="#9A6A0C" />
    </svg>
  );
}
