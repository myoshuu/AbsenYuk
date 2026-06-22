interface IllustrationProps {
  name: "hero-qr" | "empty-chat" | "success" | "error";
  className?: string;
}

export default function Illustration({ name, className = "" }: IllustrationProps) {
  switch (name) {
    case "hero-qr":
      return (
        <svg viewBox="0 0 360 340" width="100%" height="auto" fill="none" className={className} style={{ maxWidth: 360 }}>
          {/* Phone Frame */}
          <rect x="70" y="10" width="220" height="280" rx="20" stroke="currentColor" strokeWidth="2" fill="#fff" opacity="0.5" />
          {/* QR Code */}
          <rect x="110" y="50" width="140" height="140" rx="8" fill="#111" />
          <rect x="120" y="60" width="40" height="40" rx="4" fill="#fff" />
          <rect x="200" y="60" width="40" height="40" rx="4" fill="#fff" />
          <rect x="120" y="140" width="40" height="40" rx="4" fill="#fff" />
          <rect x="200" y="100" width="20" height="20" rx="2" fill="#fff" />
          <rect x="200" y="140" width="20" height="20" rx="2" fill="#fff" />
          <rect x="160" y="100" width="20" height="20" rx="2" fill="#fff" />
          <rect x="140" y="80" width="60" height="60" rx="4" fill="#fff" />
          <rect x="160" y="60" width="20" height="20" rx="2" fill="#fff" />
          <rect x="140" y="140" width="40" height="20" rx="2" fill="#fff" />
          <rect x="160" y="120" width="60" height="20" rx="2" fill="#fff" />
          {/* Scanning line */}
          <line x1="100" y1="155" x2="260" y2="155" stroke="#1a7a4a" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
          <circle cx="180" cy="155" r="4" fill="#1a7a4a" opacity="0.8" />
          {/* Cross-hair lines */}
          <line x1="180" y1="30" x2="180" y2="45" stroke="#1a7a4a" strokeWidth="2" opacity="0.4" />
          <line x1="180" y1="200" x2="180" y2="215" stroke="#1a7a4a" strokeWidth="2" opacity="0.4" />
          <line x1="100" y1="120" x2="115" y2="120" stroke="#1a7a4a" strokeWidth="2" opacity="0.4" />
          <line x1="245" y1="120" x2="260" y2="120" stroke="#1a7a4a" strokeWidth="2" opacity="0.4" />
          {/* Dashed scanning border */}
          <rect x="105" y="45" width="150" height="150" rx="10" stroke="#1a7a4a" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
          {/* SCAN button */}
          <rect x="120" y="220" width="120" height="36" rx="18" fill="#1a7a4a" />
          <text x="180" y="243" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600">SCAN</text>
          {/* Dots at corners */}
          <circle cx="100" cy="40" r="3" fill="#1a7a4a" opacity="0.5" />
          <circle cx="260" cy="40" r="3" fill="#1a7a4a" opacity="0.5" />
          <circle cx="100" cy="210" r="3" fill="#1a7a4a" opacity="0.5" />
          <circle cx="260" cy="210" r="3" fill="#1a7a4a" opacity="0.5" />
          {/* Bottom decorative elements */}
          <rect x="130" y="272" width="40" height="4" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="180" y="272" width="60" height="4" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="250" y="272" width="30" height="4" rx="2" fill="currentColor" opacity="0.15" />
          {/* Floating dots */}
          <circle cx="60" cy="80" r="4" fill="#1a7a4a" opacity="0.2" />
          <circle cx="300" cy="160" r="3" fill="#1a7a4a" opacity="0.15" />
          <circle cx="55" cy="220" r="2" fill="#1a7a4a" opacity="0.2" />
          <circle cx="305" cy="70" r="2" fill="#1a7a4a" opacity="0.2" />
          {/* People icons below */}
          <circle cx="110" cy="310" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <circle cx="180" cy="310" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <circle cx="250" cy="310" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path d="M100 326c0-4 4.5-6 10-6s10 2 10 6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <path d="M170 326c0-4 4.5-6 10-6s10 2 10 6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <path d="M240 326c0-4 4.5-6 10-6s10 2 10 6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      );

    case "empty-chat":
      return (
        <svg viewBox="0 0 120 100" width="120" height="100" fill="none" className={className}>
          <rect x="10" y="16" width="100" height="58" rx="8" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="42" r="3" fill="currentColor" opacity="0.3" />
          <circle cx="42" cy="42" r="3" fill="currentColor" opacity="0.3" />
          <circle cx="52" cy="42" r="3" fill="currentColor" opacity="0.3" />
          <rect x="56" cy="32" width="30" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <rect x="56" cy="42" width="22" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <rect x="56" cy="52" width="26" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        </svg>
      );

    case "success":
      return (
        <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className={className}>
          <circle cx="40" cy="40" r="36" stroke="#1a7a4a" strokeWidth="3" opacity="0.2" />
          <circle cx="40" cy="40" r="24" fill="#1a7a4a" opacity="0.1" />
          <path d="M28 40l8 8 16-16" stroke="#1a7a4a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "error":
      return (
        <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className={className}>
          <circle cx="40" cy="40" r="36" stroke="#dc2626" strokeWidth="3" opacity="0.2" />
          <circle cx="40" cy="40" r="24" fill="#dc2626" opacity="0.1" />
          <path d="M30 30l20 20M50 30l-20 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
