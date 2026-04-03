import { useEffect, useState } from 'react';
import http from '../api/http';

export default function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);

  const load = async () => {
    const [{ data: bookingData }, { data: listingData }] = await Promise.all([
      http.get('/bookings/mine'),
      http.get('/listings')
    ]);
    setBookings(bookingData.bookings);
    setListings(listingData.listings);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await http.patch(`/bookings/${id}/status`, { status });
    load();
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-3xl font-bold text-white">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"><p className="text-slate-400">Marketplace items</p><p className="mt-2 text-3xl font-bold text-white">{listings.length}</p></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"><p className="text-slate-400">My bookings</p><p className="mt-2 text-3xl font-bold text-white">{bookings.length}</p></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"><p className="text-slate-400">Pending approvals</p><p className="mt-2 text-3xl font-bold text-white">{bookings.filter((booking) => booking.status === 'pending').length}</p></div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-xl font-semibold text-white">Bookings</h2>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{booking.title}</p>
                  <p className="text-sm text-slate-400">{booking.start_date} → {booking.end_date} · {booking.pricing_unit} · €{booking.total_price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">{booking.status}</span>
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(booking.id, 'confirmed')} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">Confirm</button>
                      <button onClick={() => updateStatus(booking.id, 'cancelled')} className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white">Decline</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
