"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const SUBJECTS = [
  'Product Enquiry',
  'Bulk / Wholesale Order',
  'Farm Layout Consultation',
  'Delivery / Shipping',
  'After-Sales Support',
  'Other',
];

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
      } else {
        throw new Error(data.error ?? 'Failed to send message');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', padding: '3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Get in <span style={{ color: 'var(--primary-color)' }}>Touch</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            Have a question about a product or need a custom irrigation solution? We typically respond within a few hours.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>

          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>Contact Information</h2>

            {[
              { icon: '📍', label: 'Location', value: 'Nairobi, Kenya' },
              { icon: '📞', label: 'Phone', value: '+254 714 584 085', href: 'tel:+254714584085' },
              { icon: '📧', label: 'Email', value: 'info@kevotech.co.ke', href: 'mailto:info@kevotech.co.ke' },
              { icon: '🕐', label: 'Business Hours', value: 'Mon–Sat: 8 AM – 6 PM EAT' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{item.label}</div>
                  {item.href ? (
                    <a href={item.href} style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '1rem' }}>{item.value}</a>
                  ) : (
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem' }}>{item.value}</div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: '#dcfce7', borderRadius: '1rem', border: '1px solid #86efac' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>Free Farm Consultation</h3>
              <p style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.6, margin: 0 }}>
                Not sure which system is right for your farm? Our agronomic team offers free layout planning and product selection advice. Just send us your farm size and crop type.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#f0fdf4', borderRadius: '1rem', border: '1px solid #86efac' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem' }}>Message Sent!</h3>
                <p style={{ color: '#166534', marginBottom: '2rem' }}>We received your message and will get back to you shortly.</p>
                <button onClick={() => setStatus('idle')} className="btn btn-primary">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Send a Message</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input required value={form.name} onChange={set('name')} placeholder="Jane Wanjiku" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="0712 345 678" style={inp} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Email</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" style={inp} />
                </div>

                <div>
                  <label style={lbl}>Subject</label>
                  <select value={form.subject} onChange={set('subject')} style={inp}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={lbl}>Message *</label>
                  <textarea required value={form.message} onChange={set('message')} placeholder="Tell us about your farm, what crops you grow, and what you need…" rows={5} style={{ ...inp, resize: 'vertical', minHeight: '120px' }} />
                </div>

                {status === 'error' && (
                  <div style={{ padding: '0.875rem 1rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
                    {errorMsg}
                  </div>
                )}

                <button type="submit" disabled={status === 'sending'} className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '1rem', padding: '0.875rem', opacity: status === 'sending' ? 0.7 : 1 }}>
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' };
const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'white', boxSizing: 'border-box' };
