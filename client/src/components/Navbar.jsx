import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const navBase = 'text-sm text-slate-300 transition hover:text-white';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center">
          <BrandLogo />
        </Link>
        <nav className="flex items-center gap-3 md:gap-5">
          <NavLink to="/" className={navBase}>Kuulutused</NavLink>
          {user && <NavLink to="/create-listing" className={navBase}>Lisa kuulutus</NavLink>}
          {user && <NavLink to="/dashboard" className={navBase}>Halduspaneel</NavLink>}
          {user && <NavLink to="/messages" className={navBase}>S&otilde;numid</NavLink>}
          {!user ? (
            <NavLink to="/auth" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20">Logi sisse</NavLink>
          ) : (
            <button onClick={logout} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/20 hover:text-white">Logi v&auml;lja</button>
          )}
        </nav>
      </div>
    </header>
  );
}
