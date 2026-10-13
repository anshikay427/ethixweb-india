import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { pool, initDb } from './db.js';
import { requireAdmin } from './middleware.js';

const app = express();
const port = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD are required');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
const enquiryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many enquiries from this network. Please try again later.' } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 6, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many sign-in attempts. Please try again later.' } });
const validate = (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ error: 'Please check the highlighted fields.', fields: errors.array().map(e => ({ field: e.path, message: e.msg })) }); next(); };
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ethixweb-india-api' }));

app.post('/api/leads', enquiryLimiter, [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your name (2–120 characters).'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Phone number is too long.'),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: 160 }).withMessage('Company name is too long.'),
  body('service').trim().isIn(['Website & app development','AI & automation','Digital marketing','CRM & integrations','Not sure yet']).withMessage('Choose a service.'),
  body('budget').optional({ values: 'falsy' }).isIn(['Under ₹50k','₹50k–₹2L','₹2L–₹5L','₹5L+','Need guidance']).withMessage('Choose a budget range.'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Tell us a little more (10–2000 characters).'),
  body('website').optional().isString().isLength({ max: 200 })
], validate, async (req, res, next) => {
  try {
    // Honeypot: bot-filled hidden field gets a generic success response without persistence.
    if (req.body.website) return res.status(201).json({ message: 'Thanks — your enquiry has been received.' });
    const { name, email, phone, company, service, budget, message } = req.body;
    const result = await pool.query('INSERT INTO leads (name,email,phone,company,service,budget,message) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at', [name,email,phone || null,company || null,service,budget || null,message]);
    res.status(201).json({ message: 'Thanks — your enquiry is in. We will be in touch soon.', id: result.rows[0].id });
  } catch (err) { next(err); }
});

app.post('/api/admin/login', loginLimiter, [body('email').trim().isEmail(), body('password').isString().isLength({ min: 1, max: 200 })], validate, async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const expectedEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const emailMatches = email === expectedEmail;
  const passwordMatches = await bcrypt.compare(req.body.password, passwordHash);
  if (!emailMatches || !passwordMatches) return res.status(401).json({ error: 'Invalid email or password.' });
  const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, email, expiresIn: 7200 });
});
app.get('/api/admin/leads', requireAdmin, async (req, res, next) => {
  try { const { rows } = await pool.query('SELECT id,name,email,phone,company,service,budget,message,status,created_at FROM leads ORDER BY created_at DESC LIMIT 500'); res.json({ leads: rows }); } catch (err) { next(err); }
});
app.patch('/api/admin/leads/:id', requireAdmin, [body('status').isIn(['new','contacted','qualified','closed']).withMessage('Invalid lead status.')], validate, async (req, res, next) => {
  try { const { rows } = await pool.query('UPDATE leads SET status=$1 WHERE id=$2 RETURNING id,status', [req.body.status, req.params.id]); if (!rows.length) return res.status(404).json({ error: 'Lead not found.' }); res.json({ lead: rows[0] }); } catch (err) { next(err); }
});
app.delete('/api/admin/leads/:id', requireAdmin, async (req, res, next) => {
  try { const { rowCount } = await pool.query('DELETE FROM leads WHERE id=$1', [req.params.id]); if (!rowCount) return res.status(404).json({ error: 'Lead not found.' }); res.status(204).end(); } catch (err) { next(err); }
});
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong on our side. Please try again.' }); });
initDb().then(() => app.listen(port, () => console.log(`Ethixweb API listening on ${port}`))).catch(err => { console.error('Database initialisation failed:', err); process.exit(1); });
