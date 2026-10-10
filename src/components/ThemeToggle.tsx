'use client';
import {useEffect, useState} from 'react';
import {Moon, Sun} from 'lucide-react';

type Mode = 'dark' | 'light';

/** Light/dark switch. The head script resolves the initial mode (stored choice, else the OS preference) before paint. */
export function ThemeToggle({label, modes, showLabel = false}: {label: string; modes: Record<Mode, string>; showLabel?: boolean}) {
  const [mode, setMode] = useState<Mode>('light');
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setMode(root.dataset.theme === 'dark' ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {attributes: true, attributeFilter: ['data-theme']});
    return () => observer.disconnect();
  }, []);
  function toggle() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    document.documentElement.dataset.theme = next;
    try { window.localStorage.setItem('aureon-theme', next); } catch { /* storage may be blocked */ }
  }
  const text = `${label}: ${modes[mode]}`;
  return <button type="button" className={`theme-toggle${showLabel ? ' with-label' : ''}`} aria-label={text} title={text} aria-pressed={mode === 'dark'} onClick={toggle}>
    <span className="theme-icons" aria-hidden="true">
      <Sun className="ti ti-light" strokeWidth={1.6}/>
      <Moon className="ti ti-dark" strokeWidth={1.6}/>
    </span>
    {showLabel && <span className="theme-label" aria-hidden="true">{modes[mode]}</span>}
  </button>;
}
