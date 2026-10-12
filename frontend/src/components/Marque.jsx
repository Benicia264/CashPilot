export default function Marque({ taille = 28 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0B3D34" />
      <path
        d="M7 21 L13 14 L18 18 L25 9"
        fill="none"
        stroke="#E6A817"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}