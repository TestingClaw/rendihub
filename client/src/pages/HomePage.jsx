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
      <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 via-slate-900 to-blue-500/10 p-8 md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-300">Modern rental marketplace</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">Rent almost anything with a beautiful marketplace built for speed and trust.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">Search by category, compare flexible day/week/month pricing, book availability, talk directly with owners and grow a premium rental brand.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Live listings</p>
              <p className="mt-2 text-3xl font-bold text-white">{listings.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Categories</p>
              <p className="mt-2 text-3xl font-bold text-white">{categories.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Pricing options</p>
              <p className="mt-2 text-3xl font-bold text-white">3</p>
            </div>
          </div>
        </div>
      </section>
      <SearchFilters filters={filters} setFilters={setFilters} categories={categories} onSearch={loadData} />
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        {!listings.length && (
          <div className="col-span-full rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-400">
            No listings yet. Create the first premium rental offer.
          </div>
        )}
      </section>
    </div>
  );
}
