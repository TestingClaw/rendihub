import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';

export default function CreateListingPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: '',
    title: '',
    description: '',
    location: '',
    priceDay: ''
  });
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    http.get('/listings/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    Array.from(files).forEach((file) => payload.append('images', file));
    await http.post('/listings', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
      <h1 className="mb-6 text-3xl font-bold text-white">Lisa kuulutus</h1>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Vali kategooria</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input placeholder="Pealkiri" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="md:col-span-2" placeholder="Asukoht" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <textarea className="md:col-span-2" rows="5" placeholder="Kirjeldus" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" step="0.01" placeholder="Hind p&auml;evas (&euro;)" value={form.priceDay} onChange={(e) => setForm({ ...form, priceDay: e.target.value })} />
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
        <button className="md:col-span-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950">Avalda kuulutus</button>
      </form>
    </div>
  );
}
