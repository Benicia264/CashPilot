export default function Marque({ taille = 28 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#16165c" />
      <path
        d="M22.1 10.9A8 8 0 1 0 22.1 21.1"
        fill="none"
        stroke="#f8f7f3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="22.1" cy="10.9" r="2.3" fill="#e7b63c" />
    </svg>
  );
}