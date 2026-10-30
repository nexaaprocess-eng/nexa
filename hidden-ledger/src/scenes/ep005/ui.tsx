import React from 'react';
import {K} from '../../components/cine';
import {FONT_BODY, FONT_TITLE} from '../../themes/theme';
import {ramp} from '../ep004/ui';

// Episode 005 overlays. The hotel, guest name and booking numbers on the reservation screen are fictional.

/** Front-desk reservation system (drawn at 1280x800, mapped onto the desk monitor).
 * mode 'search': the confirmed booking is found, the room search runs, then "no rooms" at `failAt`.
 * mode 'bookings': bookings for tonight tick up past the 100 rooms between `from` and `to`. */
export const HotelSystem: React.FC<{frame: number; mode: 'search' | 'bookings'; failAt?: number; from?: number; to?: number}> = ({frame, mode, failAt = 1e9, from = 0, to = 1}) => {
  const head = (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 40px', background: '#1B2A38', color: '#EAF2F8', fontFamily: FONT_TITLE, fontSize: 40, fontWeight: 700}}>
      <span>FRONT DESK · Tonight</span>
      <span style={{fontSize: 30, opacity: 0.8}}>11:52 PM</span>
    </div>
  );
  if (mode === 'bookings') {
    const k = Math.max(0, Math.min(1, (frame - from) / Math.max(1, to - from)));
    const n = Math.round(97 + k * 9);
    return (
      <div style={{width: 1280, height: 800, background: '#F4F1EC', fontFamily: FONT_BODY}}>
        {head}
        <div style={{display: 'flex', gap: 40, padding: '60px 60px 0'}}>
          {[['ROOMS', '100', '#1E1B18'], ['BOOKINGS', String(n), n > 100 ? K.orange : '#1E1B18']].map(([l, v, c]) => (
            <div key={l} style={{flex: 1, background: '#FFFFFF', borderRadius: 24, padding: '40px 48px', border: '2px solid #E2DCD2'}}>
              <div style={{fontSize: 36, fontWeight: 700, color: '#7A7268', letterSpacing: 4}}>{l}</div>
              <div style={{fontFamily: FONT_TITLE, fontSize: 190, fontWeight: 700, color: c, lineHeight: 1.05}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{margin: '44px 60px', padding: '26px 40px', borderRadius: 20, background: n > 100 ? '#FBE7DA' : '#E7F1EA', fontSize: 40, fontWeight: 700, color: n > 100 ? '#9C4A1C' : '#2F6B46'}}>
          {n > 100 ? `Accepting ${n - 100} more than rooms (forecast: some won't arrive)` : 'Accepting bookings'}
        </div>
      </div>
    );
  }
  const steps = Math.max(0, Math.floor((frame - (failAt - 70)) / 10));
  const failed = frame >= failAt;
  return (
    <div style={{width: 1280, height: 800, background: '#F4F1EC', fontFamily: FONT_BODY}}>
      {head}
      <div style={{margin: '40px 60px', padding: '30px 40px', background: '#FFFFFF', borderRadius: 22, border: '2px solid #E2DCD2', fontSize: 40, color: '#1E1B18'}}>
        <div style={{fontWeight: 700}}>Booking #4821 · 1 night</div>
        <div style={{marginTop: 10, color: '#2F6B46', fontWeight: 700}}>✓ Confirmed · Paid</div>
      </div>
      <div style={{margin: '0 60px', padding: '30px 40px', borderRadius: 22, background: failed ? '#FBE3DF' : '#FFFFFF', border: failed ? `4px solid ${K.red}` : '2px solid #E2DCD2', fontSize: 46, fontWeight: 700, color: failed ? '#A23A30' : '#5B544C'}}>
        {failed ? 'No rooms available tonight' : `Finding a room${'.'.repeat(1 + (steps % 3))}`}
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, margin: '34px 60px'}}>
        {Array.from({length: 20}).map((_, i) => (
          <div key={i} style={{width: 46, height: 46, borderRadius: 8, background: failed || i < steps * 3 ? '#C9C1B6' : '#E9E4DC'}} />
        ))}
      </div>
    </div>
  );
};

/** Marks on projected anchors (facade windows, room blocks): 'dark' dims a lit window, 'cancel' greys it out with a
 * diagonal, 'noshow' rings it red, 'lit' adds a warm glow. */
export const Marks: React.FC<{a: (n: string) => [number, number, number]; names: string[]; kind: 'dark' | 'cancel' | 'noshow' | 'lit'; at: number; frame: number; size?: number; stagger?: number}> = ({a, names, kind, at, frame, size = 26, stagger = 1}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {names.map((n, i) => {
      const p = a(n);
      const k = ramp(frame, at + i * stagger, 8);
      if (k <= 0) return null;
      const s = size * (p[2] > 0 ? 1 : 1);
      if (kind === 'dark') return <rect key={n} x={p[0] - s / 2} y={p[1] - s * 0.8} width={s} height={s * 1.3} rx={3} fill={`rgba(8,10,14,${0.88 * k})`} />;
      if (kind === 'lit') return <rect key={n} x={p[0] - s / 2} y={p[1] - s * 0.8} width={s} height={s * 1.3} rx={3} fill={`rgba(255,190,110,${0.55 * k})`} />;
      if (kind === 'cancel')
        return (
          <g key={n} opacity={k}>
            <rect x={p[0] - s / 2} y={p[1] - s / 2} width={s} height={s} rx={4} fill="rgba(60,58,56,0.86)" />
            <line x1={p[0] - s / 3} y1={p[1] + s / 3} x2={p[0] + s / 3} y2={p[1] - s / 3} stroke="#B9B1A6" strokeWidth={3} />
          </g>
        );
      return <circle key={n} cx={p[0]} cy={p[1]} r={s * 0.62 * (1.4 - 0.4 * k)} fill="none" stroke={K.red} strokeWidth={5} opacity={k} />;
    })}
  </svg>
);

/** A label floating above an anchor, with a short stem. */
export const Label: React.FC<{p: [number, number, number]; text: string; sub?: string; at: number; frame: number; dy?: number; color?: string; size?: number; until?: number}> = ({p, text, sub, at, frame, dy = -40, color = K.ivory, size = 40, until}) => {
  let k = ramp(frame, at, 12);
  if (until !== undefined) k *= 1 - ramp(frame, until, 10);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: p[0], top: p[1] + dy, transform: `translate(-50%, -100%) translateY(${(1 - k) * 14}px)`, opacity: k, textAlign: 'center'}}>
      <div style={{background: K.warmBlack, borderRadius: 14, padding: '10px 20px', border: `2px solid ${color === K.ivory ? 'rgba(242,237,228,0.25)' : color}`, whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color}}>{text}</div>
        {sub ? <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: size * 0.62, color: K.ivory, opacity: 0.85}}>{sub}</div> : null}
      </div>
      <div style={{width: 3, height: Math.abs(dy) - 6, background: color, margin: '0 auto', opacity: 0.8}} />
    </div>
  );
};

/** Star rating that fills in one star (a 1-star review being written). */
export const Stars: React.FC<{x: number; y: number; at: number; frame: number}> = ({x, y, at, frame}) => {
  const k = ramp(frame, at, 10);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: k, background: K.warmBlack, borderRadius: 16, padding: '14px 24px', display: 'flex', gap: 10}}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{fontSize: 64, lineHeight: 1, color: i === 0 && frame > at + 10 ? K.orange : 'rgba(242,237,228,0.35)'}}>★</span>
      ))}
    </div>
  );
};

/** Bilingual quote card for legal / official text: original wording + English translation + who says it. */
export const LegalCard: React.FC<{x: number; y: number; w?: number; original: string; english: string; who: string; at: number; frame: number; until?: number}> = ({x, y, w = 1000, original, english, who, at, frame, until}) => {
  let k = ramp(frame, at, 14);
  if (until !== undefined) k *= 1 - ramp(frame, until, 12);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, background: 'rgba(20,17,15,0.86)', borderRadius: 20, padding: '28px 36px', borderLeft: `8px solid ${K.orange}`}}>
      <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 42, color: K.ivory, lineHeight: 1.22}}>{english}</div>
      <div style={{fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 27, color: K.ivory, opacity: 0.7, marginTop: 14, lineHeight: 1.3}}>“{original}”</div>
      <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 27, color: K.orange, marginTop: 14}}>{who}</div>
    </div>
  );
};
