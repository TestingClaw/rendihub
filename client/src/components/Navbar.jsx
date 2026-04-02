import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-cyan-400">RendiHub</Link>
        <nav className="flex items-center gap-5 text-sm text-slate-300">
          <NavLink to="/">Marketplace</NavLink>
          {user && <NavLink to="/create-listing">New listing</NavLink>}
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && <NavLink to="/messages">Messages</NavLink>}
          {!user ? (
            <NavLink to="/auth" className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950">Sign in</NavLink>
          ) : (
            <button onClick={logout} className="rounded-xl border border-slate-700 px-4 py-2">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
