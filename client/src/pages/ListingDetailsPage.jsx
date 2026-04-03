import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [freeSlots, setFreeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [returnDate, setReturnDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [review, setReview] = useState({ bookingId: '', rating: 5, comment: '' });

  const load = async () => {
    const response = await http.get(`/listings/${id}`);
    setData(response.data);
  };

  const loadSlots = async (date) => {
    try {
      const { data: slots } = await http.get('/external-booking/free-times', {
        params: { service_id: 1, date }
      });
      setFreeSlots(slots);
      setSelectedTime('');
    } catch {
      setFreeSlots([]);
    }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => { loadSlots(selectedDate); }, [selectedDate]);

  const days = useMemo(() => {
    const d1 = dayjs(selectedDate);
    const d2 = dayjs(returnDate);
    const diff = d2.diff(d1, 'day');
    return diff > 0 ? diff : 1;
  }, [selectedDate, returnDate]);

  const estimatedPrice = useMemo(() => {
    if (!data) return 0;
    return days * data.listing.pricing.day;
  }, [data, days]);

  const handleBooking = async () => {
    if (!guest.name || !guest.email || !guest.phone) {
      setError('Palun täida kõik väljad');
      return;
    }
    if (!selectedTime) {
      setError('Palun vali kellaaeg');
      return;
    }
    setLoading(true);
    setNotice('');
    setError('');
    try {
      const { data: result } = await http.post('/external-booking/book', {
        service_id: 1,
        date: selectedDate,
        time: selectedTime,
        return_datetime: `${returnDate} ${selectedTime}`,
        name: guest.name,
        email: guest.email,
        phone: guest.phone
      });
      if (result.error) {
        setError(result.error);
      } else {
        setNotice('Broneering loodud! Kinnitus saadetakse emailile.');
        setGuest({ name: '', email: '', phone: '' });
        setSelectedTime('');
        loadSlots(selectedDate);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Broneerimine ebaõnnestus');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      setNotice('');
      setError('');
      await http.post('/messages', { listingId: Number(id), body: message });
      setMessage('');
      setNotice('Sõnum saadetud');
    } catch (err) {
      setError(err.response?.data?.message || 'Sõnumi saatmine ebaõnnestus');
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();
    try {
      setNotice('');
      setError('');
      await http.post('/reviews', { ...review, bookingId: Number(review.bookingId) });
      setReview({ bookingId: '', rating: 5, comment: '' });
      setNotice('Arvustus lisatud');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Arvustuse lisamine ebaõnnestus');
    }
  };

  if (!data) {
    return <div className="py-20 text-center text-slate-400">Laadin...</div>;
  }

  const { listing, reviews } = data;
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
              <p className="mt-3 text-slate-400">{listing.location} &middot; {listing.owner.fullName}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right">
              <p className="text-sm text-slate-400">Hinnang</p>
              <p className="text-2xl font-bold text-amber-300">{listing.rating ? listing.rating.toFixed(1) : 'Uus'}</p>
            </div>
          </div>
          <p className="text-slate-300">{listing.description}</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-semibold text-white">Arvustused</h2>
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
            {!reviews.length && <p className="text-sm text-slate-400">Arvustusi pole veel.</p>}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-5 text-2xl font-semibold text-white">Broneeri</h2>

          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-cyan-400">&euro;{listing.pricing.day}</p>
            <p className="text-sm text-slate-400">päevas</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Alguskuupäev</label>
              <input type="date" value={selectedDate} min={dayjs().format('YYYY-MM-DD')}
                onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">Tagastuskuupäev</label>
              <input type="date" value={returnDate} min={dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD')}
                onChange={(e) => setReturnDate(e.target.value)} />
            </div>

            {freeSlots.length > 0 && (
              <div>
                <label className="mb-2 block text-sm text-slate-400">Vali kellaaeg</label>
                <div className="grid grid-cols-4 gap-2">
                  {freeSlots.map((slot) => (
                    <button key={slot} onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl py-2 text-sm font-medium transition ${selectedTime === slot ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-300 hover:border-cyan-400/40'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {freeSlots.length === 0 && (
              <p className="text-sm text-slate-400">Vabu aegu sellel kuupäeval pole.</p>
            )}

            <div className="rounded-2xl bg-slate-950 p-4">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{days} päeva × &euro;{listing.pricing.day}</span>
                <span className="text-xl font-bold text-cyan-400">&euro;{estimatedPrice}</span>
              </div>
            </div>

            <input placeholder="Nimi *" value={guest.name}
              onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
            <input placeholder="Email *" type="email" value={guest.email}
              onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
            <input placeholder="Telefon *" type="tel" value={guest.phone}
              onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />

            <button onClick={handleBooking} disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">
              {loading ? 'Broneerin...' : 'Broneeri'}
            </button>
          </div>

          {notice && <p className="mt-4 text-sm text-emerald-400">{notice}</p>}
          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </div>

        {user && user.id !== listing.owner.id && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-semibold text-white">Kirjuta omanikule</h2>
            <textarea rows="5" placeholder="Küsi saadavuse, üleandmise, tagatise kohta..." value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleMessage} className="mt-4 w-full rounded-2xl border border-cyan-400/40 px-4 py-3 font-semibold text-cyan-300 hover:bg-cyan-400/10">Saada sõnum</button>
          </div>
        )}
      </aside>
    </div>
  );
}
