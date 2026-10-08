"""
Rewrite hardcoded Tailwind colour utilities onto the CSS custom properties
defined in index.css.

The map is semantic, not literal: every blue collapses to the single accent,
greens to --ok, ambers to --warn, reds to --crit, and the purple/indigo family
to neutral, because a role or a document type is not a state.

Utility family matters — #E2E8F0 is a border colour in `border-[#E2E8F0]` and
a surface in `bg-[#E2E8F0]` — so each family gets its own table.
"""
import re, sys, json, io, collections

INK = {  # text-*, placeholder-*, fill-*, stroke-*, caret-*, decoration-*
    '#0F172A': '--text-primary', '#020617': '--text-primary', '#111827': '--text-primary',
    '#1E293B': '--text-primary', '#334155': '--text-secondary', '#475569': '--text-secondary',
    '#64748B': '--text-secondary', '#94A3B8': '--text-muted', '#A3AAB7': '--text-muted',
    '#CBD5E1': '--text-muted', '#E2E8F0': '--text-muted', '#F8FAFC': '--text-on-dark',
    '#F1F5F9': '--text-on-dark', '#FFFFFF': '--accent-on',
    # accent
    '#2563EB': '--accent', '#1D4ED8': '--accent', '#3B82F6': '--accent', '#1E40AF': '--accent',
    '#1E3A8A': '--accent', '#60A5FA': '--accent', '#93C5FD': '--accent', '#0EA5E9': '--accent',
    '#38BDF8': '--accent', '#0284C7': '--accent',
    # critical
    '#DC2626': '--crit', '#B91C1C': '--crit', '#EF4444': '--crit', '#991B1B': '--crit',
    '#F87171': '--crit', '#FCA5A5': '--crit', '#E11D48': '--crit', '#BE123C': '--crit',
    # warning
    '#B45309': '--warn', '#D97706': '--warn', '#C2410C': '--warn', '#EA580C': '--warn',
    '#92400E': '--warn', '#A16207': '--warn', '#F59E0B': '--warn', '#FBBF24': '--warn',
    '#CA8A04': '--warn', '#9A3412': '--warn',
    # ok
    '#15803D': '--ok', '#16A34A': '--ok', '#059669': '--ok', '#047857': '--ok',
    '#166534': '--ok', '#10B981': '--ok', '#22C55E': '--ok', '#065F46': '--ok',
    '#34D399': '--ok', '#14532D': '--ok',
    # purple family retired to neutral
    '#7C3AED': '--text-secondary', '#6D28D9': '--text-secondary', '#7E22CE': '--text-secondary',
    '#4338CA': '--text-secondary', '#6366F1': '--text-secondary', '#581C87': '--text-secondary',
    '#8B5CF6': '--text-secondary', '#A855F7': '--text-secondary', '#9333EA': '--text-secondary',
    '#5B21B6': '--text-secondary', '#4F46E5': '--text-secondary',
}

SURFACE = {  # bg-*
    '#FFFFFF': '--bg-surface', '#FFF': '--bg-surface',
    '#F8FAFC': '--bg-subtle', '#F1F5F9': '--bg-subtle', '#F0F4F8': '--bg-subtle',
    '#FDFBF7': '--bg-canvas', '#F9FAFB': '--bg-subtle',
    '#E2E8F0': '--bg-muted', '#CBD5E1': '--bg-muted', '#E8EDF2': '--bg-muted',
    # a solid dark button becomes the accent button
    '#0F172A': '--accent', '#1E293B': '--accent-hover', '#334155': '--accent-hover',
    '#020617': '--accent',
    # accent
    '#2563EB': '--accent', '#1D4ED8': '--accent-hover', '#3B82F6': '--accent',
    '#EFF6FF': '--accent-soft', '#DBEAFE': '--accent-soft', '#EEF2FF': '--bg-subtle',
    '#E0F2FE': '--accent-soft', '#F0F9FF': '--accent-soft',
    # critical
    '#DC2626': '--crit', '#B91C1C': '--crit', '#EF4444': '--crit',
    '#FEF2F2': '--crit-soft', '#FEE2E2': '--crit-soft', '#FECACA': '--crit-soft',
    '#FFF1F2': '--crit-soft',
    # warning
    '#D97706': '--warn', '#B45309': '--warn', '#EA580C': '--warn', '#F59E0B': '--warn',
    '#FFFBEB': '--warn-soft', '#FEF3C7': '--warn-soft', '#FFF7ED': '--warn-soft',
    '#FDE68A': '--warn-soft', '#FEF9C3': '--warn-soft',
    # ok
    '#16A34A': '--ok', '#15803D': '--ok', '#059669': '--ok',
    '#F0FDF4': '--ok-soft', '#ECFDF5': '--ok-soft', '#DCFCE7': '--ok-soft',
    '#D1FAE5': '--ok-soft',
    # purple retired
    '#F5F3FF': '--bg-subtle', '#F3E8FF': '--bg-subtle', '#FAF5FF': '--bg-subtle',
    '#7C3AED': '--text-secondary', '#6D28D9': '--text-secondary',
}

LINE = {  # border-*, ring-*, divide-*, outline-*
    '#E2E8F0': '--border-default', '#F1F5F9': '--border-subtle', '#EEF0F5': '--border-subtle',
    '#CBD5E1': '--border-strong', '#C8D5E2': '--border-strong', '#94A3B8': '--border-strong',
    '#E8EDF2': '--border-default', '#F8FAFC': '--border-subtle',
    '#0F172A': '--accent', '#1E293B': '--border-strong', '#334155': '--border-strong',
    # accent
    '#2563EB': '--accent', '#1D4ED8': '--accent', '#3B82F6': '--accent',
    '#BFDBFE': '--accent-line', '#93C5FD': '--accent-line', '#DBEAFE': '--accent-line',
    '#C7D2FE': '--border-default',
    # critical
    '#DC2626': '--crit', '#B91C1C': '--crit', '#EF4444': '--crit', '#F87171': '--crit',
    '#FECACA': '--crit-line', '#FCA5A5': '--crit-line', '#FEE2E2': '--crit-line',
    # warning
    '#D97706': '--warn', '#B45309': '--warn', '#F59E0B': '--warn',
    '#FDE68A': '--warn-line', '#FED7AA': '--warn-line', '#FCD34D': '--warn-line',
    '#FEF3C7': '--warn-line',
    # ok
    '#16A34A': '--ok', '#15803D': '--ok', '#059669': '--ok',
    '#BBF7D0': '--ok-line', '#A7F3D0': '--ok-line', '#86EFAC': '--ok-line',
    '#D1FAE5': '--ok-line',
    # purple retired
    '#DDD6FE': '--border-default', '#D8B4FE': '--border-default', '#E9D5FF': '--border-default',
    '#7C3AED': '--border-strong',
}

FAMILY = {
    'bg': SURFACE, 'from': SURFACE, 'via': SURFACE, 'to': SURFACE,
    'text': INK, 'placeholder': INK, 'fill': INK, 'stroke': INK,
    'caret': INK, 'decoration': INK, 'accent': INK,
    'border': LINE, 'ring': LINE, 'divide': LINE, 'outline': LINE, 'shadow': LINE,
}

# named tailwind palette -> same semantic groups
def named(fam, hue, shade):
    light = shade is not None and int(shade) <= 200
    mid = shade is not None and 300 <= int(shade) <= 400
    if hue in ('white',):
        return '--bg-surface' if fam in ('bg', 'from', 'via', 'to') else '--accent-on'
    if hue in ('black',):
        return '--text-primary'
    if hue in ('slate', 'gray', 'zinc', 'neutral', 'stone'):
        if fam in ('bg', 'from', 'via', 'to'):
            return '--bg-subtle' if light else '--bg-muted'
        if fam in ('border', 'ring', 'divide', 'outline', 'shadow'):
            return '--border-default' if light else '--border-strong'
        if shade is None:
            return '--text-secondary'
        n = int(shade)
        return '--text-muted' if n <= 400 else ('--text-secondary' if n <= 600 else '--text-primary')
    group = ('--accent' if hue in ('blue', 'sky', 'cyan') else
             '--crit' if hue in ('red', 'rose') else
             '--warn' if hue in ('amber', 'yellow', 'orange') else
             '--ok' if hue in ('green', 'emerald', 'teal', 'lime') else
             None)
    if group is None:   # purple / violet / indigo / fuchsia / pink -> neutral
        if fam in ('bg', 'from', 'via', 'to'):
            return '--bg-subtle'
        if fam in ('border', 'ring', 'divide', 'outline', 'shadow'):
            return '--border-default'
        return '--text-secondary'
    if fam in ('bg', 'from', 'via', 'to'):
        return group + '-soft' if light else group
    if fam in ('border', 'ring', 'divide', 'outline', 'shadow'):
        return group + '-line' if (light or mid) else group
    return group

VARIANT = r'(?:[a-z][a-z0-9-]*:)*'
FAMS = '|'.join(sorted(FAMILY, key=len, reverse=True))
HEXRE = re.compile(r'\b(' + VARIANT + r')(' + FAMS + r')-\[(#[0-9A-Fa-f]{3,8})\](/\d{1,3})?')
NAMEDRE = re.compile(
    r'\b(' + VARIANT + r')(' + FAMS + r')-'
    r'(white|black|slate|gray|zinc|neutral|stone|blue|sky|cyan|red|rose|amber|yellow|orange|'
    r'green|emerald|teal|lime|purple|violet|indigo|fuchsia|pink)'
    r'(?:-(\d{2,3}))?(/\d{1,3})?\b')

stats = collections.Counter()
unmapped = collections.Counter()

def sub_hex(m):
    variants, fam, hx, opacity = m.group(1), m.group(2), m.group(3).upper(), m.group(4) or ''
    table = FAMILY[fam]
    var = table.get(hx)
    if var is None:
        unmapped[f'{fam}-[{hx}]'] += 1
        return m.group(0)
    stats['hex'] += 1
    return f'{variants}{fam}-[var({var})]{opacity}'

def sub_named(m):
    variants, fam, hue, shade, opacity = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5) or ''
    var = named(fam, hue, shade)
    if var is None:
        unmapped[f'{fam}-{hue}-{shade}'] += 1
        return m.group(0)
    stats['named'] += 1
    return f'{variants}{fam}-[var({var})]{opacity}'

# a dark: colour utility is redundant once the base reads from a themed var
DARKRE = re.compile(r'\s*\bdark:(?:' + FAMS + r')-\[var\(--[a-z-]+\)\](?:/\d{1,3})?')

def process(path, write=True):
    s = io.open(path, encoding='utf-8').read()
    out = HEXRE.sub(sub_hex, s)
    out = NAMEDRE.sub(sub_named, out)
    before = len(DARKRE.findall(out))
    out = DARKRE.sub('', out)
    stats['dark_dropped'] += before
    # tidy double spaces introduced inside class strings
    out = re.sub(r'(className=(?:"|\{`|`))([^"`]*?)  +', lambda m: m.group(1) + m.group(2) + ' ', out)
    if write and out != s:
        io.open(path, 'w', encoding='utf-8').write(out)
    return out != s

if __name__ == '__main__':
    files = sys.argv[1:]
    changed = [f for f in files if process(f)]
    print(json.dumps({'files_changed': len(changed), **stats}, indent=1))
    if unmapped:
        print('UNMAPPED (left alone):')
        for k, v in unmapped.most_common(40):
            print(f'  {v:>4}  {k}')
