import { useEffect, useState } from 'react';
import http from '../api/http';
import ListingCard from '../components/ListingCard';
import SearchFilters from '../components/SearchFilters';

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ query: '', category: '', location: '', minPrice: '', maxPrice: '' });

  const loadData = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const [{ data: listingData }, { data: categoryData }] = await Promise.all([
      http.get('/listings', { params }),
      http.get('/listings/categories')
    ]);
    setListings(listingData.listings);
    setCategories(categoryData.categories);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-950 p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">Rental marketplace MVP</p>
        <h1 className="max-w-2xl text-4xl font-bold text-white">Rent almost anything. Fast search, live availability, direct messaging.</h1>
      </section>
      <SearchFilters filters={filters} setFilters={setFilters} categories={categories} onSearch={loadData} />
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </section>
    </div>
  );
}
