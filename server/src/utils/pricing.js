import dayjs from 'dayjs';

export const calculateBookingPrice = ({ startDate, endDate, pricingUnit, listing }) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const dayCount = end.diff(start, 'day') + 1;

  if (dayCount <= 0) {
    throw new Error('Invalid booking range');
  }

  if (pricingUnit === 'day') {
    return Number(listing.price_day) * dayCount;
  }

  if (pricingUnit === 'week') {
    return Number(listing.price_week) * Math.ceil(dayCount / 7);
  }

  return Number(listing.price_month) * Math.ceil(dayCount / 30);
};
