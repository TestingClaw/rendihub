import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const AJABRONEERIMINE_URL = 'https://konsultatsioon.ajabroneerimine.ee/?ajax=1';

router.get('/services', asyncHandler(async (_req, res) => {
  const response = await fetch(`${AJABRONEERIMINE_URL}&action=getServices`);
  const data = await response.json();
  res.json(data);
}));

router.get('/staff', asyncHandler(async (req, res) => {
  const { service_id } = req.query;
  const response = await fetch(`${AJABRONEERIMINE_URL}&action=getStaff&service_id=${service_id}`);
  const data = await response.json();
  res.json(data);
}));

router.get('/free-times', asyncHandler(async (req, res) => {
  const { service_id, staff_id, date } = req.query;
  let url = `${AJABRONEERIMINE_URL}&action=getFreeTimes&service_id=${service_id}&date=${date}`;
  if (staff_id) url += `&staff_id=${staff_id}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
}));

router.post('/book', asyncHandler(async (req, res) => {
  const { service_id, staff_id, location_id, date, time, return_datetime, name, phone, email } = req.body;

  const fd = new FormData();
  fd.append('action', 'book');
  fd.append('service_id', service_id);
  if (staff_id) fd.append('staff_id', staff_id);
  if (location_id) fd.append('location_id', location_id);
  fd.append('date', date);
  fd.append('time', time);
  if (return_datetime) fd.append('return_datetime', return_datetime);
  fd.append('name', name);
  fd.append('phone', phone);
  fd.append('email', email);
  fd.append('sms_consent', '1');
  fd.append('newsletter_consent', '0');

  const response = await fetch(AJABRONEERIMINE_URL, { method: 'POST', body: fd });
  const data = await response.json();
  res.json(data);
}));

export default router;
