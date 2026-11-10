import { useEffect, useState } from 'react';

export const residentTabs = ['beranda', 'iuran', 'info', 'rumah', 'akun'] as const;
export type ResidentTab = typeof residentTabs[number];
type HouseTab = 'specs' | 'occupants' | 'vehicles' | 'permits' | 'pass';
type InfoTab = 'announcements' | 'facilities' | 'sanitation' | 'complaints';

export function readResidentNavigation(search: string) {
  const params = new URLSearchParams(search);
  const tab = params.get('tab') as ResidentTab;
  const house = params.get('rumah') as HouseTab;
  const info = params.get('info') as InfoTab;
  return {
    tab: residentTabs.includes(tab) ? tab : 'beranda' as ResidentTab,
    house: ['specs', 'occupants', 'vehicles', 'permits', 'pass'].includes(house) ? house : 'specs' as HouseTab,
    info: ['announcements', 'facilities', 'sanitation', 'complaints'].includes(info) ? info : 'announcements' as InfoTab,
  };
}

export function useResidentNavigation(initialSearch = '') {
  const [{ tab: activeTab, house: rumahSubTab, info: infoSubTab }, setNavigation] = useState(() => readResidentNavigation(initialSearch));

  useEffect(() => {
    const restore = () => setNavigation(readResidentNavigation(window.location.search));
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const navigateTo = (tab: ResidentTab, subtab?: { house?: HouseTab; info?: InfoTab }) => {
    const url = new URL(window.location.href);
    const previous = readResidentNavigation(url.search);
    if (previous.tab !== tab) url.searchParams.set('tab', tab);
    if (subtab?.house && previous.house !== subtab.house) url.searchParams.set('rumah', subtab.house);
    if (subtab?.info && previous.info !== subtab.info) url.searchParams.set('info', subtab.info);
    if (url.search === window.location.search) return;
    window.history.pushState(window.history.state, '', url);
    setNavigation(readResidentNavigation(url.search));
    if (tab !== activeTab) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  };

  return {
    activeTab, rumahSubTab, infoSubTab, navigateTo, setActiveTab: navigateTo,
    setRumahSubTab: (tab: HouseTab) => navigateTo('rumah', { house: tab }),
    setInfoSubTab: (tab: InfoTab) => navigateTo('info', { info: tab }),
  };
}
