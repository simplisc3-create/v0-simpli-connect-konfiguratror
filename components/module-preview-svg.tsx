interface ModulePreviewSVGProps {
  type: string
  className?: string
  selected?: boolean
}

export function ModulePreviewSVG({ type, className = "h-8 w-8", selected = false }: ModulePreviewSVGProps) {
  const strokeColor = selected ? "currentColor" : "currentColor"
  const fillColor = selected ? "currentColor" : "currentColor"

  switch (type) {
    case "ohne-seitenwaende":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" strokeDasharray="4 2" />
        </svg>
      )

    case "ohne-rueckwand":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="2">
          <rect x="4" y="4" width="24" height="24" rx="2" />
        </svg>
      )

    case "mit-rueckwand":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <rect x="6" y="6" width="20" height="20" fill={fillColor} fillOpacity="0.15" />
        </svg>
      )

    case "mit-tueren":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <line x1="16" y1="4" x2="16" y2="28" />
          <circle cx="12" cy="16" r="1.5" fill={fillColor} />
          <circle cx="20" cy="16" r="1.5" fill={fillColor} />
        </svg>
      )

    case "mit-klapptuer":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <line x1="10" y1="10" x2="22" y2="10" strokeWidth="2" />
        </svg>
      )

    case "mit-doppelschublade":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <line x1="4" y1="16" x2="28" y2="16" />
          <line x1="10" y1="10" x2="22" y2="10" strokeWidth="2" />
          <line x1="10" y1="22" x2="22" y2="22" strokeWidth="2" />
        </svg>
      )

    case "abschliessbare-tueren":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <line x1="16" y1="4" x2="16" y2="28" />
          <circle cx="12" cy="16" r="1.5" fill={fillColor} />
          <circle cx="20" cy="16" r="1.5" fill={fillColor} />
          <circle cx="16" cy="8" r="2" fill={fillColor} />
        </svg>
      )

    case "leer":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
        </svg>
      )

    case "mit-tuer-links":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <rect x="6" y="6" width="20" height="20" fill={fillColor} fillOpacity="0.15" />
          <line x1="9" y1="10" x2="9" y2="22" strokeWidth="2" />
        </svg>
      )

    case "mit-tuer-rechts":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <rect x="6" y="6" width="20" height="20" fill={fillColor} fillOpacity="0.15" />
          <line x1="23" y1="10" x2="23" y2="22" strokeWidth="2" />
        </svg>
      )

    case "mit-abschliessbarer-tuer-links":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <rect x="6" y="6" width="20" height="20" fill={fillColor} fillOpacity="0.15" />
          <line x1="9" y1="10" x2="9" y2="22" strokeWidth="2" />
          <circle cx="16" cy="8" r="2" fill={fillColor} />
        </svg>
      )

    default:
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" stroke={strokeColor} strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
        </svg>
      )
  }
}
