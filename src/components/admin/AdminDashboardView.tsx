import { ArrowUpRight, ChevronRight, CircleDot, LayoutGrid } from 'lucide-react';
import { roleLabels } from '../../lib/navigation';
import { getWorkspaceNavigation, workItems, type WorkKey, type WorkspaceRole } from '../../lib/dashboard-workspace';
import { formatRupiah } from '../../lib/format';

interface Props {
  role: WorkspaceRole;
  name: string;
  counts: Partial<Record<WorkKey, number | null>>;
}

const showValue = (key: WorkKey, value: number | null | undefined) =>
  value == null ? '—' : key === 'cash' ? formatRupiah(value) : new Intl.NumberFormat('id-ID').format(value);
const isQueue = (key: WorkKey) => key === 'payments' || key === 'complaints' || key === 'bookings' || key === 'maintenance';

export function AdminDashboardView({ role, name, counts }: Props) {
  const { title, groups, items, shortcuts } = getWorkspaceNavigation(role);
  const first = items[0];
  const primary = first && isQueue(first)
    ? items.find(key => isQueue(key) && (counts[key] ?? 0) > 0) ?? first
    : first;
  const primaryValue = primary ? counts[primary] : null;
  return (
    <div className="workspace" data-workspace-role={role}>
      <header className="workspace-heading">
        <div>
          <p className="workspace-kicker"><CircleDot size={15} aria-hidden="true" /> {roleLabels[role]}</p>
          <h1>{title}</h1>
          <p>{name}</p>
        </div>
        {shortcuts[0] && <a className="workspace-button" href={shortcuts[0].href}>{shortcuts[0].label}<ArrowUpRight size={17} aria-hidden="true" /></a>}
      </header>

      <div className="workspace-overview">
        {primary && <section className="workspace-focus" data-tone={isQueue(primary) && primaryValue === 0 ? 'mint' : workItems[primary].tone} aria-labelledby="workspace-priority">
          <p className="workspace-kicker">Fokus utama</p>
          <h2 id="workspace-priority">{workItems[primary].label}</h2>
          <p className="workspace-value" aria-label={primaryValue == null ? 'Data belum tersedia' : undefined}>{showValue(primary, primaryValue)}</p>
          {primaryValue == null && <p className="workspace-unavailable">Data belum tersedia</p>}
          <a className="workspace-text-link" href={workItems[primary].href}>Buka rincian <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>}
        <section className="workspace-panel" aria-labelledby="workspace-summary">
          <h2 id="workspace-summary">{items.length > 1 ? 'Pantauan lain' : 'Pintasan'}</h2>
          {items.length > 1 && <ul className="workspace-rows">{items.filter(key => key !== primary).map(key => (
            <li key={key}>
              <a href={workItems[key].href} className="workspace-row">
                <span className="workspace-dot" data-tone={workItems[key].tone} aria-hidden="true" />
                <span className="min-w-0">{workItems[key].label}</span>
                <strong className="workspace-row-value" aria-label={counts[key] == null ? 'Data belum tersedia' : undefined}>{showValue(key, counts[key])}</strong>
                <ChevronRight size={16} aria-hidden="true" />
              </a>
            </li>
          ))}</ul>}
          {shortcuts.length > 1 && <nav aria-label="Pintasan peran" className="workspace-shortcuts">
            {shortcuts.slice(1).map(item => <a key={item.href} href={item.href}>{item.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}
          </nav>}
        </section>
      </div>

      <section aria-labelledby="workspace-modules" className="workspace-directory">
        <h2 id="workspace-modules"><LayoutGrid size={19} aria-hidden="true" /> Modul kerja</h2>
        <div className="workspace-directory-grid">
          {groups.map(group => <section className="workspace-module-group" key={group.label}>
            <h3>{group.label}</h3>
            <ul>{group.items.map(({ label, href, icon: Icon }) => <li key={href}>
              <a href={href}><Icon size={17} aria-hidden="true" /><span>{label}</span><ChevronRight size={14} aria-hidden="true" /></a>
            </li>)}</ul>
          </section>)}
        </div>
      </section>
    </div>
  );
}
