// Skate de lado (shape com as pontas levantadas + trucks + rodinhas),
// no mesmo traço dos ícones do Heroicons (outline, 1.5)
export function SkateIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1.5 7.5c.7 1.5 1.8 2.3 3.5 2.3h14c1.7 0 2.8-.8 3.5-2.3" />
      <path d="M7 9.8v2.2M17 9.8v2.2" />
      <circle cx="7" cy="14" r="2" />
      <circle cx="17" cy="14" r="2" />
    </svg>
  )
}
