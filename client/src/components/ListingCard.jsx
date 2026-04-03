import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const image = listing.images?.[0] || 'https://placehold.co/800x500/0f172a/38bdf8?text=RendiHub';

  return (
    <Link to={`/listings/${listing.id}`} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-slate-950/30 backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.07]">
      <div className="relative overflow-hidden">
        <img src={image} alt={listing.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-4">
          <div className="inline-flex rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
            {listing.categoryName}
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
            <p className="text-sm text-slate-400">{listing.location}</p>
          </div>
          <div className="rounded-full bg-amber-400/10 px-3 py-1 text-right text-sm text-amber-300">
            {listing.rating ? `★ ${listing.rating.toFixed(1)}` : 'New'}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-slate-300">{listing.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">by {listing.owner.fullName}</span>
          <span className="font-semibold text-cyan-300">€{listing.pricing.day}/day</span>
        </div>
      </div>
    </Link>
  );
}
