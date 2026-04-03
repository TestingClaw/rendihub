import dayjs from 'dayjs';

export const calculateBookingPrice = ({ startDate, endDate, listing }) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const dayCount = end.diff(start, 'day') + 1;

  if (dayCount <= 0) {
    throw new Error('Invalid booking range');
  }

  return Number(listing.price_day) * dayCount;
};
