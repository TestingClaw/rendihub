import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const image = listing.images?.[0] || 'https://placehold.co/800x500/0f172a/38bdf8?text=RendiHub';

  return (
    <Link to={`/listings/${listing.id}`} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/30">
      <img src={image} alt={listing.title} className="h-52 w-full object-cover" />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
            <p className="text-sm text-slate-400">{listing.location} · {listing.categoryName}</p>
          </div>
          <div className="text-right text-sm text-amber-300">
            {listing.rating ? `★ ${listing.rating.toFixed(1)}` : 'New'}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-slate-300">{listing.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">by {listing.owner.fullName}</span>
          <span className="font-semibold text-cyan-400">€{listing.pricing.day}/day</span>
        </div>
      </div>
    </Link>
  );
}
