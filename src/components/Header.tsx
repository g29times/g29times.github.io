import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { key: 'nav.home', path: '/#home' },
    { key: 'nav.about', path: '/#about' },
    { key: 'nav.context', path: '/#context' },
    { key: 'nav.taste', path: '/#taste' },
    { key: 'nav.variable', path: '/#variable' },
    { key: 'nav.builder', path: '/#builder' },
    { key: 'nav.contact', path: '/#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const targetId = path.slice(2);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    if (path.startsWith('/#')) return location.hash === path.slice(1);
    if (path.includes('?category=')) {
      const category = path.split('category=')[1];
      return location.search.includes(`category=${category}`);
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary">
      <div className="container max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link 
            to="/" 
            className="font-serif text-xl font-bold text-primary-foreground hover:opacity-80 transition-opacity"
          >
            {language === 'en' ? 'SNR' : '信噪比'}
          </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    className={`text-sm font-semibold uppercase tracking-wide transition-opacity px-3 py-2 ${
                      isActive(item.path)
                        ? 'text-primary-foreground'
                        : 'text-primary-foreground/80 hover:text-primary-foreground'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground transition-opacity px-3 py-1.5 rounded-md hover:bg-primary-foreground/10"
            >
              {language === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
