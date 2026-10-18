import { cn } from "@/lib/utils";

// The "wheeloh" wordmark from /public/applogo.svg, split into one path per
// letter so each glyph can be animated on its own.
const LETTERS = [
  "M19 27.5H1L22.5 98.5H32.5184C36.7123 98.5 40.4607 95.8831 41.9059 91.946L54 59L70 98.5H86L109 27.5H100.183C95.8906 27.5 92.077 30.2392 90.7064 34.3068L77.5 73.5L58.5 27.5H49.5L31.5 73.5L19 27.5Z",
  "M135.5 98.5H117V10.5C117 4.97716 121.477 0.5 127 0.5H135.5V36C151.03 17.7614 180.867 27.8061 182.205 51.7233L182.5 57V98.5H175.5C169.977 98.5 165.5 94.0228 165.5 88.5V57C164.213 38.5382 137.113 38.49 135.76 56.9471L135.5 60.5V98.5Z",
  "M250.965 78.5451L257 85.9996L247.027 92.534C225.208 106.829 196.014 92.81 193.528 66.8446L193.405 65.5663C191.562 46.3124 206.463 29.5082 225.797 28.9311C243.315 28.4081 258.312 41.5547 260 58.9996V66.4996H209.5C209.051 79.7319 222.986 88.5758 234.768 82.5372L245.013 77.2867C247.045 76.2453 249.529 76.7704 250.965 78.5451ZM243 56.4996H210C212.372 37.2878 240.163 37.351 243 56.4996Z",
  "M326.965 78.5451L333 85.9996L323.027 92.534C301.208 106.829 272.014 92.81 269.528 66.8446L269.405 65.5663C267.562 46.3124 282.463 29.5082 301.797 28.9311C319.315 28.4081 334.312 41.5547 336 58.9996V66.4996H285.5C285.051 79.7319 298.986 88.5758 310.768 82.5372L321.013 77.2867C323.045 76.2453 325.529 76.7704 326.965 78.5451ZM319 56.4996H286C288.372 37.2878 316.163 37.351 319 56.4996Z",
  "M363.5 98.5H344.5V10.5C344.5 4.97715 348.977 0.5 354.5 0.5H363.5V98.5Z",
  "M409.5 98.5C429.658 98.5 446 82.83 446 63.5C446 44.17 429.658 28.5 409.5 28.5C389.342 28.5 373 44.17 373 63.5C373 82.83 389.342 98.5 409.5 98.5ZM410.029 81.5C420.538 81.5 429.057 73.4411 429.057 63.5C429.057 53.5589 420.538 45.5 410.029 45.5C399.519 45.5 391 53.5589 391 63.5C391 73.4411 399.519 81.5 410.029 81.5Z",
  "M476.5 98.5H458V10.5C458 4.97716 462.477 0.5 468 0.5H476.5V36C492.03 17.7614 521.867 27.8061 523.205 51.7233L523.5 57V98.5H516.5C510.977 98.5 506.5 94.0228 506.5 88.5V57C505.213 38.5382 478.113 38.49 476.76 56.9471L476.5 60.5V98.5Z",
];

interface WordmarkProps {
  className?: string;
  /** Accessible name. Pass `null` when the wordmark is decorative. */
  title?: string | null;
  /** Letters rise from a mask when an ancestor (or this svg) gets `data-in`. */
  animated?: boolean;
  /** Base delay in ms for the animated variant. */
  delay?: number;
}

export default function Wordmark({ className, title = "Wheeloh", animated = false, delay = 0 }: WordmarkProps) {
  return (
    <svg
      viewBox="0 -1 525 101"
      fill="currentColor"
      className={cn("block h-auto", animated && "wm-animate", className)}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      style={{ ["--d" as string]: delay }}
    >
      {LETTERS.map((d, i) => (
        <path
          key={i}
          d={d}
          fillRule="evenodd"
          clipRule="evenodd"
          stroke="currentColor"
          strokeWidth={1}
          className="wm-letter"
          style={{ ["--i" as string]: i }}
        />
      ))}
    </svg>
  );
}
