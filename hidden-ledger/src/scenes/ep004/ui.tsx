import React from 'react';
import {Easing, interpolate} from 'remotion';
import {K} from '../../components/cine';
import {FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Episode 004 screen UIs (drawn at 1280x800 and mapped onto the 3D screens) + small overlay helpers.
// The airline, routes and flight numbers on these screens are fictional.

const ease = (v: number) => Easing.out(Easing.cubic)(Math.max(0, Math.min(1, v)));
export const ramp = (frame: number, at: number, dur = 10) => ease((frame - at) / dur);

const Row: React.FC<{children: React.ReactNode; hi?: boolean; o?: number; ty?: number}> = ({children, hi, o = 1, ty = 0}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '22px 34px',
      margin: '0 40px 18px',
      borderRadius: 18,
      background: hi ? '#FFF4E8' : '#FFFFFF',
      border: hi ? `4px solid ${K.orange}` : '2px solid #E4DED5',
      opacity: o,
      transform: `translateY(${ty}px)`,
      fontFamily: FONT_BODY,
      color: '#1E1B18',
    }}
  >
    {children}
  </div>
);

/** Flight search results; the $20 fare lands at the top at `hit`. */
export const BookingSearch: React.FC<{frame: number; hit: number}> = ({frame, hit}) => {
  const rows = [
    {t: '06:10 → 07:55', c: 'SkyLow 4812', p: 20, hi: true},
    {t: '09:40 → 11:25', c: 'SkyLow 4816', p: 47},
    {t: '13:05 → 14:50', c: 'Network Air 221', p: 138},
    {t: '18:30 → 20:15', c: 'SkyLow 4820', p: 89},
  ];
  return (
    <div style={{width: 1280, height: 800, background: '#F4F1EC'}}>
      <div style={{height: 110, background: '#1E1B18', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 24}}>
        <div style={{width: 46, height: 46, borderRadius: 23, background: K.orange}} />
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: '#fff'}}>Search flights</div>
        <div style={{marginLeft: 'auto', fontFamily: FONT_BODY, fontSize: 32, color: '#C9C2B8'}}>One way · 1 adult · Tue</div>
      </div>
      <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: '#6A625A', margin: '26px 44px'}}>4 results · sorted by price</div>
      {rows.map((r, i) => {
        const o = ramp(frame, hit - 30 + i * 6, 10);
        const pulse = r.hi ? 1 + 0.05 * Math.sin(Math.max(0, frame - hit) / 5) * Math.exp(-Math.max(0, frame - hit) / 40) : 1;
        return (
          <Row key={i} hi={r.hi && frame >= hit} o={o} ty={(1 - o) * 20}>
            <div>
              <div style={{fontSize: 40, fontWeight: 700}}>{r.t}</div>
              <div style={{fontSize: 30, color: '#7A7168'}}>{r.c} · direct</div>
            </div>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: r.hi ? 76 : 54, color: r.hi ? K.orange : '#1E1B18', transform: `scale(${pulse})`}}>${r.p}</div>
          </Row>
        );
      })}
    </div>
  );
};

/** Checkout: extras get added one by one; the total climbs. */
export const Checkout: React.FC<{frame: number; adds: number[]; totalAt?: number}> = ({frame, adds, totalAt}) => {
  const items = [
    {l: 'Fare', p: 20},
    {l: 'Cabin bag', p: 25},
    {l: 'Window seat', p: 12},
    {l: 'Checked suitcase', p: 35},
  ];
  const shown = items.filter((_, i) => i === 0 || frame >= adds[i - 1]);
  const target = shown.reduce((s, x) => s + x.p, 0);
  const lastAt = shown.length > 1 ? adds[shown.length - 2] : 0;
  const prev = target - (shown.length > 1 ? shown[shown.length - 1].p : 0);
  const total = shown.length > 1 ? Math.round(prev + (target - prev) * ramp(frame, lastAt, 12)) : target;
  return (
    <div style={{width: 1280, height: 800, background: '#F4F1EC'}}>
      <div style={{height: 110, background: '#1E1B18', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 24}}>
        <div style={{width: 46, height: 46, borderRadius: 23, background: K.orange}} />
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: '#fff'}}>Your trip</div>
        <div style={{marginLeft: 'auto', fontFamily: FONT_BODY, fontSize: 32, color: '#C9C2B8'}}>Step 3 of 5 · Extras</div>
      </div>
      <div style={{height: 24}} />
      {shown.map((it, i) => {
        const o = i === 0 ? 1 : ramp(frame, adds[i - 1], 8);
        return (
          <Row key={it.l} o={o} ty={(1 - o) * -16}>
            <div style={{fontSize: 42, fontWeight: 600}}>{i ? '+ ' : ''}{it.l}</div>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 48}}>${it.p}</div>
          </Row>
        );
      })}
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1B18', borderRadius: 20, padding: '20px 34px'}}>
        <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, color: '#C9C2B8'}}>Total</div>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 78, color: totalAt !== undefined && frame >= totalAt ? K.orange : '#fff'}}>${total}</div>
      </div>
    </div>
  );
};

/** Price comparison results: the budget fare always on top. */
export const Comparison: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const rows = [
    {c: 'SkyLow', p: '$20', hi: true},
    {c: 'BudgetJet', p: '$34'},
    {c: 'Network Air', p: '$141'},
    {c: 'Network Air (flex)', p: '$219'},
  ];
  return (
    <div style={{width: 1280, height: 800, background: '#EEF1F4'}}>
      <div style={{height: 110, background: '#24323B', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 20}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: '#fff'}}>compare fares</div>
        <div style={{marginLeft: 'auto', fontFamily: FONT_BODY, fontSize: 32, color: '#AFC0CB'}}>Cheapest first ▾</div>
      </div>
      <div style={{height: 26}} />
      {rows.map((r, i) => {
        const o = ramp(frame, at + i * 5, 10);
        return (
          <Row key={i} hi={r.hi} o={o} ty={(1 - o) * 18}>
            <div style={{fontSize: 42, fontWeight: 700}}>{r.c}</div>
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: r.hi ? 70 : 52, color: r.hi ? K.orange : '#1E1B18'}}>{r.p}</div>
          </Row>
        );
      })}
    </div>
  );
};

/** Departures board: fares tick upwards (mode 'fares') or every flight is cancelled (mode 'cancelled'). */
export const Board: React.FC<{frame: number; mode: 'fares' | 'cancelled'; at?: number}> = ({frame, mode, at = 0}) => {
  const dests = ['LISBON', 'PORTO', 'MILAN', 'BERLIN', 'DUBLIN', 'MALAGA'];
  return (
    <div style={{width: 1280, height: 700, background: '#0B0F16', fontFamily: FONT_TITLE, color: '#F5D27A', padding: '26px 34px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 40, color: '#FFFFFF', marginBottom: 16, letterSpacing: 3}}>
        <span>DEPARTURES</span>
        <span>{mode === 'fares' ? 'LOWEST FARE' : 'STATUS'}</span>
      </div>
      {dests.map((d, i) => {
        const base = [20, 24, 31, 19, 27, 22][i];
        const steps = Math.max(0, Math.floor((frame - at - i * 7) / 26));
        const fare = base + steps * [9, 7, 11, 8, 6, 10][i];
        const cancelled = mode === 'cancelled' && frame >= at + i * 10;
        return (
          <div key={d} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 52, padding: '12px 0', borderTop: '2px solid #1E2733', letterSpacing: 2}}>
            <span style={{width: 150, color: '#9FB0C2'}}>{`${String(6 + i * 2).padStart(2, '0')}:${i % 2 ? '45' : '10'}`}</span>
            <span style={{flex: 1, color: '#FFFFFF'}}>{d}</span>
            {mode === 'fares' ? <span style={{color: fare > base ? K.orange : '#F5D27A'}}>${fare}</span> : <span style={{color: cancelled ? '#FF6B5E' : '#F5D27A'}}>{cancelled ? 'CANCELLED' : 'ON TIME'}</span>}
          </div>
        );
      })}
    </div>
  );
};

/** Chips that appear one by one (screen space). */
export const Chips: React.FC<{x: number; y: number; items: {t: string; at: number}[]; frame: number; vertical?: boolean; size?: number}> = ({x, y, items, frame, vertical = true, size = 40}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 16, alignItems: 'flex-start'}}>
    {items.map((it, i) => {
      const k = ramp(frame, it.at, 10);
      return (
        <div
          key={i}
          style={{
            opacity: k,
            transform: `translateX(${(1 - k) * -24}px)`,
            background: K.warmBlack,
            border: '2px solid rgba(242,237,228,0.22)',
            borderLeft: `8px solid ${K.orange}`,
            borderRadius: 14,
            padding: '10px 22px',
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: size,
            color: K.ivory,
            whiteSpace: 'nowrap',
          }}
        >
          {it.t}
        </div>
      );
    })}
  </div>
);

/** Quote card (screen space). */
export const Quote: React.FC<{x: number; y: number; w?: number; text: string; who: string; at: number; frame: number; size?: number}> = ({x, y, w = 1100, text, who, at, frame, size = 44}) => {
  const k = ramp(frame, at, 14);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, background: K.warmBlack, borderRadius: 18, padding: '26px 34px', border: '2px solid rgba(242,237,228,0.2)'}}>
      <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color: K.ivory, lineHeight: 1.22}}>“{text}”</div>
      <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, color: K.orange, marginTop: 12}}>{who}</div>
    </div>
  );
};

/** Top-down seat map fill: seats at projected anchors fill up to `n` (orange beyond `orangeFrom`). */
export const SeatFill: React.FC<{anchors: Record<string, [number, number, number]>; order: string[]; n: number; orangeFrom: number; hero: string; r?: number}> = ({anchors, order, n, orangeFrom, hero, r = 13}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {order.map((k, i) => {
      const p = anchors[`seat_${k}`];
      if (!p) return null;
      const filled = i < n || k === hero;
      const col = k === hero ? K.ivory : i >= orangeFrom ? K.orange : K.slate;
      return <circle key={k} cx={p[0]} cy={p[1]} r={filled ? r : r * 0.55} fill={filled ? col : 'none'} stroke={filled ? 'rgba(0,0,0,0.35)' : 'rgba(242,237,228,0.55)'} strokeWidth={filled ? 2 : 2.5} />;
    })}
  </svg>
);

export const clampLerp = (frame: number, f0: number, f1: number, a: number, b: number) =>
  interpolate(frame, [f0, Math.max(f0 + 1, f1)], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
