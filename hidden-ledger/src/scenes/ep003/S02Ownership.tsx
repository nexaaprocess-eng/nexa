import React from 'react';
import {interpolate} from 'remotion';
import {INK, PaperBackdrop} from '../../components/apps';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs} from '../../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// "When you owned your software": archival cream-paper look (inverted palette, same brand colours).
// Boxed software next to books; box -> disc -> receipt; version upgrades as a choice; business support
// contracts renewing every year (Oracle 10-K); the calendar flips to May 2013; Creative Suite 6 gets its
// "last major update" stamp while new features move to the Creative Cloud subscription (Adobe 10-K).

const Box: React.FC<{title: string; ver: string; color: string; w?: number; o?: number; style?: React.CSSProperties}> = ({title, ver, color, w = 260, o = 1, style}) => (
  <div style={{width: w, height: w * 1.25, position: 'relative', opacity: o, ...style}}>
    <div style={{position: 'absolute', left: w * 0.1, top: -w * 0.06, width: w * 0.9, height: w * 0.08, background: shadeC(color), transform: 'skewX(-40deg)', transformOrigin: 'bottom left'}} />
    <div style={{position: 'absolute', right: -w * 0.08, top: -w * 0.03, width: w * 0.08, height: w * 1.25, background: shadeC(color), transform: 'skewY(-40deg)'}} />
    <div style={{position: 'absolute', inset: 0, background: color, border: `4px solid ${INK}`, borderRadius: 6, padding: w * 0.08, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.12, color: '#fff', lineHeight: 1.05}}>{title}</div>
      <div style={{alignSelf: 'center', width: w * 0.5, height: w * 0.5, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0 12%, #cfd6df 13% 40%, #9aa5b3 41% 100%)', border: `3px solid ${INK}`}} />
      <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.2, color: '#fff', textAlign: 'right'}}>{ver}</div>
    </div>
  </div>
);
const shadeC = (c: string) => `color-mix(in srgb, ${c} 70%, black)`;

const Stamp: React.FC<{text: string; color?: string; t: number; rot?: number; size?: number}> = ({text, color = C.red, t, rot = -8, size = 54}) => (
  <div style={{display: 'inline-block', opacity: t > 0 ? 1 : 0, transform: `rotate(${rot}deg) scale(${1.6 - 0.6 * Math.min(1, t)})`, border: `7px solid ${color}`, color, borderRadius: 14, padding: '6px 22px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, background: 'rgba(246,239,226,0.9)'}}>{text}</div>
);

export const S02Ownership: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  return (
    <SceneShell drift={[0, -10]} zoom={0.025} beatCamera={false}>
      <PaperBackdrop />

      {/* beat 0: a shelf with books and software boxes */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(0, 0)}}>
        <div style={{position: 'absolute', left: 200, right: 200, top: 700, height: 26, background: '#8A6E45', borderRadius: 4}} />
        <div style={{position: 'absolute', left: 260, top: 390, display: 'flex', gap: 10, alignItems: 'flex-end'}}>
          {['#7A4DDB', '#2FA36B', '#E4572E', '#3A8FD9', '#E0A21A'].map((c, i) => (
            <div key={c} style={{width: 56, height: 300 - (i % 2) * 30, background: c, border: `4px solid ${INK}`, borderRadius: 4, transform: `translateY(${(1 - b.ramp(0, i * 0.1, 0.4)) * -60}px)`, opacity: b.ramp(0, i * 0.1, 0.3)}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 720, top: 370, display: 'flex', gap: 40}}>
          <Box title="PHOTO STUDIO" ver="v6" color="#3A8FD9" o={b.ramp(0, 0.6, 0.4)} />
          <Box title="OFFICE WRITER" ver="2010" color="#2FA36B" o={b.ramp(0, 0.9, 0.4)} />
          <Box title="SOUND DESK" ver="v3" color="#E4572E" o={b.ramp(0, 1.2, 0.4)} />
        </div>
        <Abs x={0} y={150} w={1920} align="center">
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 84, color: INK}}>Buying software was like buying a book</div>
        </Abs>
      </div>

      {/* beat 1: pay once, keep it */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(1, 1)}}>
        <Box title="PHOTO STUDIO" ver="v6" color="#3A8FD9" w={300} style={{position: 'absolute', left: 230, top: 330, transform: `rotate(${-6 + 6 * b.ramp(1, 0, 0.6)}deg)`}} />
        {/* disc slides out */}
        <div style={{position: 'absolute', left: 300 + 300 * b.ramp(1, 0.8, 0.8), top: 480, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0 12%, #cfd6df 13% 40%, #9aa5b3 41% 100%)', border: `4px solid ${INK}`, transform: `rotate(${frame * 6}deg)`, opacity: b.ramp(1, 0.8, 0.3)}} />
        {/* receipt */}
        <div style={{position: 'absolute', left: 860, top: 260, width: 380, background: '#fff', border: `3px solid ${INK}`, padding: 28, fontFamily: FONT_TITLE, color: INK, fontSize: 34, opacity: b.rampAt(b.word(1, /paid|once/i, 0.15), 0.4), transform: `translateY(${(1 - b.rampAt(b.word(1, /paid|once/i, 0.15), 0.6)) * 60}px)`}}>
          <div style={{fontWeight: 700}}>RECEIPT</div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16}}>
            <span>Photo Studio 6</span>
            <span>×1</span>
          </div>
          <div style={{borderTop: `3px dashed ${INK}`, marginTop: 16, paddingTop: 12, fontWeight: 700}}>PAID ONCE ✓</div>
        </div>
        {/* the years go by and it still runs */}
        <div style={{position: 'absolute', left: 1320, top: 260, width: 460, opacity: b.rampAt(b.word(1, /keep|long/i, 0.7), 0.4)}}>
          <div style={{background: '#20252C', border: `6px solid ${INK}`, borderRadius: 16, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.cream, fontFamily: FONT_TITLE, fontSize: 40, fontWeight: 700}}>Photo Studio 6 ▸ running</div>
          <div style={{width: 120, height: 50, background: INK, margin: '0 auto'}} />
          <div style={{textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 72, color: INK, fontVariantNumeric: 'tabular-nums'}}>
            {2010 + Math.min(6, Math.floor(b.rampAt(b.word(1, /keep|long/i, 0.7), 4) * 6))}
          </div>
          <div style={{textAlign: 'center', fontFamily: FONT_BODY, fontSize: 32, color: '#4A4741'}}>still yours, still working</div>
        </div>
      </div>

      {/* beat 2: upgrades as a choice */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(2, 2)}}>
        <div style={{position: 'absolute', left: 200, top: 300, display: 'flex', gap: 70, alignItems: 'flex-end'}}>
          {['v5', 'v6', 'v7'].map((v, i) => (
            <Box key={v} title="PHOTO STUDIO" ver={v} color="#3A8FD9" w={230} o={i < 2 ? 0.5 + 0.5 * (i === 1 ? 1 : 0) : b.ramp(2, 0.5, 0.5)} style={{transform: `scale(${i === 2 ? 0.9 + 0.1 * b.pop(2, 0.5) : 1})`}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 1180, top: 330, width: 600, display: 'flex', flexDirection: 'column', gap: 26, opacity: b.ramp(2, 1.2, 0.5)}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 56, color: INK}}>Version 7 is out.</div>
          {[
            ['Pay for the upgrade', C.orange],
            ['Keep using version 6', '#2FA36B'],
          ].map(([l, c], i) => (
            <div key={l} style={{border: `5px solid ${c}`, borderRadius: 20, padding: '20px 28px', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, color: INK, background: '#fff', transform: `translateX(${(1 - b.ramp(2, 1.6 + i * 0.4, 0.4)) * 80}px)`, opacity: b.ramp(2, 1.6 + i * 0.4, 0.4)}}>
              {l}
            </div>
          ))}
          <div style={{fontFamily: FONT_BODY, fontSize: 34, color: '#4A4741'}}>Your call, every time.</div>
        </div>
      </div>

      {/* beat 3: business software already paid every year */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(3, 3)}}>
        <div style={{position: 'absolute', right: 64, top: 112, maxWidth: 900, textAlign: 'right', fontFamily: FONT_BODY, fontSize: 26, color: '#4A4741'}}>
          <b style={{color: '#B86E00', letterSpacing: 2}}>SOURCE </b>Oracle Form 10-K, fiscal 2026
        </div>
        {/* server rack */}
        <div style={{position: 'absolute', left: 240, top: 250, width: 330, height: 560, background: '#2A3038', border: `6px solid ${INK}`, borderRadius: 14, padding: 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14}}>
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} style={{height: 46, background: '#3A424C', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px'}}>
              <div style={{width: 12, height: 12, borderRadius: 6, background: (frame + i * 7) % 30 < 15 ? '#4E9F7D' : '#2B5A46'}} />
              <div style={{flex: 1, height: 8, background: '#2A3038', borderRadius: 4}} />
            </div>
          ))}
        </div>
        {/* yearly renewals stack up */}
        <div style={{position: 'absolute', left: 660, top: 250, display: 'flex', gap: 22}}>
          {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((y, i) => {
            const o = b.ramp(3, 0.4 + i * 0.7, 0.4);
            return (
              <div key={y} style={{width: 230, background: '#fff', border: `3px solid ${INK}`, padding: 20, fontFamily: FONT_BODY, color: INK, opacity: o, transform: `translateY(${(1 - o) * -50}px) rotate(${(i % 2 ? 2 : -2)}deg)`}}>
                <div style={{fontWeight: 700, fontSize: 30}}>Support contract</div>
                <div style={{fontSize: 30, marginTop: 6}}>{y}</div>
                <div style={{marginTop: 12}}>
                  <Stamp text="RENEWED" color="#2FA36B" t={b.ramp(3, 0.7 + i * 0.7, 0.3)} size={34} />
                </div>
              </div>
            );
          })}
        </div>
        <Abs x={660} y={580} w={1120} o={b.rampAt(b.word(3, /Oracle/i, 0.5), 0.5)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 46, color: INK, lineHeight: 1.2}}>
            “Substantially all of our customers elect to purchase and renew their software support contracts annually.”
          </div>
          <div style={{fontFamily: FONT_BODY, fontSize: 32, color: '#4A4741', marginTop: 12}}>— Oracle, annual report</div>
        </Abs>
      </div>

      {/* beat 4: May 2013 */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(4, 4)}}>
        {[2010, 2011, 2012, 2013].map((y, i) => {
          const flip = b.ramp(4, 1.0 + i * 0.35, 0.3);
          const last = i === 3;
          return (
            <div key={y} style={{position: 'absolute', left: 710, top: 250, width: 500, height: 520, background: '#fff', border: `6px solid ${INK}`, borderRadius: 18, overflow: 'hidden', transform: `rotateX(${last ? 0 : flip * 95}deg) rotate(${last ? Math.sin(frame / 28) * 1.5 : 0}deg)`, transformOrigin: 'top', opacity: last ? b.ramp(4, 1.9, 0.2) : 1 - (flip > 0.98 ? 1 : 0), zIndex: 10 - i, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}>
              <div style={{height: 120, background: last ? C.red : '#6A665F', color: '#fff', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{last ? 'MAY' : 'JAN'}</div>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 190, color: INK, textAlign: 'center', marginTop: 50}}>{y}</div>
            </div>
          );
        })}
        <Abs x={0} y={820} w={1920} align="center" o={b.rampAt(b.word(4, /changed|rules/i, 0.8), 0.4)}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 58, color: INK}}>One of the best-known software makers changed the rules</div>
        </Abs>
      </div>

      {/* beat 5: Creative Suite 6 → Creative Cloud */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(5, 5)}}>
        <div style={{position: 'absolute', right: 64, top: 112, maxWidth: 900, textAlign: 'right', fontFamily: FONT_BODY, fontSize: 26, color: '#4A4741'}}>
          <b style={{color: '#B86E00', letterSpacing: 2}}>SOURCE </b>Adobe Form 10-K, fiscal 2013
        </div>
        <Box title="CREATIVE SUITE" ver="6" color="#6A665F" w={300} style={{position: 'absolute', left: 230, top: 330}} />
        <div style={{position: 'absolute', left: 170, top: 520}}>
          <Stamp text="LAST MAJOR UPDATE" t={b.rampAt(b.word(5, /last/i, 0.75), 0.25)} size={46} />
        </div>
        {/* new features fly from the box to the cloud */}
        {Array.from({length: 6}).map((_, i) => {
          const p = interpolate(frame - b.word(5, /only|Creative Cloud/i, 0.3) - i * 6, [0, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <div key={i} style={{position: 'absolute', left: interpolate(p, [0, 1], [600, 1240]), top: interpolate(p, [0, 1], [460, 420]) - Math.sin(p * Math.PI) * 120 + i * 18, width: 44, height: 44, borderRadius: 12, background: C.orange, border: `3px solid ${INK}`, opacity: p > 0 && p < 1 ? 1 : 0, color: INK, fontWeight: 700, fontSize: 28, textAlign: 'center', lineHeight: '40px'}}>★</div>;
        })}
        <div style={{position: 'absolute', left: 1180, top: 260, width: 600, opacity: b.rampAt(b.word(5, /Creative Cloud/i, 0.3), 0.5)}}>
          <svg width={600} height={330} viewBox="0 0 600 330">
            <path d="M120 290 Q30 290 40 210 Q50 140 140 150 Q160 60 270 70 Q360 20 420 110 Q560 100 560 210 Q560 290 470 290 Z" fill="#fff" stroke={INK} strokeWidth={8} />
            <text x={300} y={225} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={50} fill={INK}>
              Creative Cloud
            </text>
          </svg>
          <div style={{textAlign: 'center', marginTop: 10}}>
            <span style={{background: C.orange, color: INK, borderRadius: 99, padding: '10px 30px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 36, whiteSpace: 'nowrap'}}>new features: subscribers only</span>
          </div>
        </div>
        <Abs x={160} y={800} w={1600}>
          <div style={{fontFamily: FONT_BODY, fontSize: 34, color: INK, fontWeight: 600}}>
            Adobe, May 2013: new creative features only for Creative Cloud subscribers; CS6 the last major update for perpetual licensees
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
