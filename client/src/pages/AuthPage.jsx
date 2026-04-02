import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

const initialState = { fullName: '', email: '', password: '', location: '' };

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await http.post(endpoint, payload);
      login(data);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Auth failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <div className="mb-6 flex gap-2 rounded-2xl bg-slate-950 p-1">
        {['login', 'register'].map((value) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === value ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
          >
            {value === 'login' ? 'Login' : 'Register'}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </>
        )}
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </div>
  );
}
