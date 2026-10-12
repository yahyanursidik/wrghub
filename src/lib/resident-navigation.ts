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

export function useResidentNavigation() {
  const [activeTab, setTab] = useState<ResidentTab>('beranda');
  const [rumahSubTab, setHouse] = useState<HouseTab>('specs');
  const [infoSubTab, setInfo] = useState<InfoTab>('announcements');

  useEffect(() => {
    const restore = () => {
      const state = readResidentNavigation(window.location.search);
      setTab(state.tab); setHouse(state.house); setInfo(state.info);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const updateUrl = (key: string, value: string) => {
    const url = new URL(window.location.href);
    if ((url.searchParams.get(key) || (key === 'tab' ? 'beranda' : '')) === value) return;
    url.searchParams.set(key, value);
    window.history.pushState(window.history.state, '', url);
  };

  const setActiveTab = (tab: ResidentTab) => {
    setTab(tab); updateUrl('tab', tab);
    if (tab !== activeTab) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  };

  return {
    activeTab, rumahSubTab, infoSubTab, setActiveTab,
    setRumahSubTab: (tab: HouseTab) => { setHouse(tab); updateUrl('rumah', tab); },
    setInfoSubTab: (tab: InfoTab) => { setInfo(tab); updateUrl('info', tab); },
  };
}
