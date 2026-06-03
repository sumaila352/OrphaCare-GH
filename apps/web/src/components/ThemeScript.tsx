import { THEME_STORAGE_KEY } from '@/lib/theme';

/** Runs before paint to avoid theme flash. */
export function ThemeScript() {
  const js = `
(function(){
  try {
    var k=${JSON.stringify(THEME_STORAGE_KEY)};
    var s=localStorage.getItem(k);
    var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    var t=d?'dark':'light';
    document.documentElement.setAttribute('data-theme',t);
    document.documentElement.setAttribute('data-bs-theme',t);
    document.documentElement.style.colorScheme=t;
  } catch(e) {}
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
