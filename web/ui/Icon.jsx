import React from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Columns2,
  Download,
  Ellipsis,
  ExternalLink,
  FileText,
  Flame,
  House,
  Layers,
  Map as MapGlyph,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Share,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Thermometer,
  Users,
  X,
  Zap,
  Wind,
  Printer,
  Upload,
  Building2,
  BookOpen,
  Trash2,
  ListChecks,
  CircleCheck,
  Plug,
  Wifi,
  Link2,
  Clock,
  CalendarDays,
  TrendingDown,
  Info,
  Pencil,
} from 'lucide-react';

const ICONS = {
  compare: Columns2,
  explore: MapGlyph,
  prepare: ClipboardList,
  evidence: FileText,
  more: Ellipsis,
  plus: Plus,
  minus: Minus,
  close: X,
  search: Search,
  check: Check,
  chevron: ChevronRight,
  down: ChevronDown,
  back: ChevronLeft,
  reset: RotateCcw,
  share: Share,
  home: House,
  snowflake: Snowflake,
  thermometer: Thermometer,
  bolt: Zap,
  people: Users,
  filter: SlidersHorizontal,
  layers: Layers,
  book: BookOpen,
  download: Download,
  external: ExternalLink,
  pin: MapPin,
  list: ListChecks,
  flame: Flame,
  arrow: ArrowRight,
  building: Building2,
  shield: ShieldCheck,
  trash: Trash2,
  print: Printer,
  upload: Upload,
  wind: Wind,
  plug: Plug,
  wifi: Wifi,
  link: Link2,
  clock: Clock,
  calendar: CalendarDays,
  trend: TrendingDown,
  info: Info,
  pencil: Pencil,
  map: MapGlyph,
  devices: Thermometer,
  ready: CircleCheck,
};

/** One icon set, one stroke weight. `filled` draws the selected variant used by the tab bar. */
export function Icon({ name, size = 24, filled = false, className = '' }) {
  const Glyph = ICONS[name] || Plus;
  return (
    <Glyph
      size={size}
      strokeWidth={1.75}
      absoluteStrokeWidth
      aria-hidden="true"
      focusable="false"
      className={`ui-icon ${className}`}
      data-filled={filled ? 'true' : undefined}
    />
  );
}

/** Tinted rounded-square tile that leads a row, like Settings. */
export function IconTile({ name, tone = 'ember' }) {
  return (
    <span className="ios-tile" data-tone={tone} aria-hidden="true">
      <Icon name={name} size={18} />
    </span>
  );
}
