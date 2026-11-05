import { useState } from 'react';

export default function useNav() {
  const [view, setView] = useState({ name: 'home' });
  // `from` is the public page the auth screen was opened from, so "Back" returns there.
  const [pub, setPub] = useState({ page: 'home', tab: 'login', from: 'home' });
  const go = (next) => { setView(next); window.scrollTo(0, 0); };
  const home = () => go({ name: 'home' });
  const openLesson = (id) => go({ name: 'lesson', id });
  const goPub = (page) => { setPub((current) => ({ ...current, page })); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openAuth = (tab = 'login') => {
    setPub((current) => ({ page: 'auth', tab, from: current.page === 'auth' ? current.from : current.page }));
    window.scrollTo(0, 0);
  };
  const resetPublic = () => setPub({ page: 'home', tab: 'login', from: 'home' });
  return { view, pub, go, home, openLesson, goPub, openAuth, resetPublic };
}
