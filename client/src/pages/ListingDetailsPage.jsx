import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [range, setRange] = useState([new Date(), dayjs().add(2, 'day').toDate()]);
  const [pricingUnit, setPricingUnit] = useState('day');
  const [message, setMessage] = useState('');
  const [review, setReview] = useState({ bookingId: '', rating: 5, comment: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const response = await http.get(`/listings/${id}`);
    setData(response.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const estimatedPrice = useMemo(() => {
    if (!data) return 0;
    const [start, end] = range;
    const days = dayjs(end).diff(dayjs(start), 'day') + 1;
    if (days <= 0) return 0;
    if (pricingUnit === 'day') return days * data.listing.pricing.day;
    if (pricingUnit === 'week') return Math.ceil(days / 7) * data.listing.pricing.week;
    return Math.ceil(days / 30) * data.listing.pricing.month;
  }, [data, range, pricingUnit]);

  const handleBooking = async () => {
    try {
      setNotice('');
      setError('');
      await http.post('/bookings', {
        listingId: Number(id),
        startDate: dayjs(range[0]).format('YYYY-MM-DD'),
        endDate: dayjs(range[1]).format('YYYY-MM-DD'),
        pricingUnit
      });
      setNotice('Booking request sent');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Booking failed');
    }
  };

  const handleMessage = async () => {
    try {
      setNotice('');
      setError('');
      await http.post('/messages', { listingId: Number(id), body: message });
      setMessage('');
      setNotice('Message sent');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Message failed');
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();
    try {
      setNotice('');
      setError('');
      await http.post('/reviews', { ...review, bookingId: Number(review.bookingId) });
      setReview({ bookingId: '', rating: 5, comment: '' });
      setNotice('Review submitted');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Review failed');
    }
  };

  if (!data) {
    return <div className="py-20 text-center text-slate-400">Loading listing...</div>;
  }

  const { listing, bookings, reviews } = data;
  const hero = listing.images?.[0] || 'https://placehold.co/1200x700/0f172a/38bdf8?text=RendiHub';

  return (
    <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
      <div className="space-y-6">
        <img src={hero} alt={listing.title} className="h-[420px] w-full rounded-[2rem] object-cover" />
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-cyan-300">{listing.categoryName}</p>
              <h1 className="text-4xl font-bold text-white">{listing.title}</h1>
              <p className="mt-3 text-slate-400">{listing.location} · Hosted by {listing.owner.fullName}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right">
              <p className="text-sm text-slate-400">Rating</p>
              <p className="text-2xl font-bold text-amber-300">{listing.rating ? listing.rating.toFixed(1) : 'New'}</p>
            </div>
          </div>
          <p className="text-slate-300">{listing.description}</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-semibold text-white">Availability calendar</h2>
          <div className="overflow-auto rounded-3xl bg-white p-4 text-slate-900">
            <Calendar selectRange onChange={setRange} value={range} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-white">{booking.start_date} → {booking.end_date}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{booking.status}</p>
              </div>
            ))}
            {!bookings.length && <p className="text-sm text-slate-400">No bookings yet.</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-semibold text-white">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{item.reviewer_name}</p>
                  <p className="text-amber-300">★ {item.rating}</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{item.comment}</p>
              </div>
            ))}
            {!reviews.length && <p className="text-sm text-slate-400">No reviews yet.</p>}
          </div>

          {user && (
            <form className="mt-6 grid gap-3" onSubmit={handleReview}>
              <input placeholder="Booking ID" value={review.bookingId} onChange={(e) => setReview({ ...review, bookingId: e.target.value })} />
              <select value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
              <textarea rows="3" placeholder="Review comment" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950">Submit review</button>
            </form>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-5 text-2xl font-semibold text-white">Pricing</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Per day</span><strong className="text-white">€{listing.pricing.day}</strong></div>
            <div className="flex justify-between"><span>Per week</span><strong className="text-white">€{listing.pricing.week}</strong></div>
            <div className="flex justify-between"><span>Per month</span><strong className="text-white">€{listing.pricing.month}</strong></div>
          </div>
          {user && user.id !== listing.owner.id && (
            <div className="mt-6 space-y-4">
              <select value={pricingUnit} onChange={(e) => setPricingUnit(e.target.value)}>
                <option value="day">Day pricing</option>
                <option value="week">Week pricing</option>
                <option value="month">Month pricing</option>
              </select>
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Estimated total</p>
                <p className="text-3xl font-bold text-cyan-400">€{estimatedPrice}</p>
              </div>
              <button onClick={handleBooking} className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950">Request booking</button>
            </div>
          )}
          {notice && <p className="mt-4 text-sm text-emerald-400">{notice}</p>}
          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </div>

        {user && user.id !== listing.owner.id && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-semibold text-white">Message owner</h2>
            <textarea rows="5" placeholder="Ask about availability, pickup, deposit..." value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleMessage} className="mt-4 w-full rounded-2xl border border-cyan-400/40 px-4 py-3 font-semibold text-cyan-300 hover:bg-cyan-400/10">Send message</button>
          </div>
        )}
      </aside>
    </div>
  );
}
