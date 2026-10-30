import React from 'react';
import {interpolate} from 'remotion';
import {APPS, AppIcon, Notice, Phone, SubRow, usd} from '../../components/apps';
import {SceneShell} from '../../components/SceneShell';
import {useBeats} from '../../components/timeline';
import {Abs, Body, Chip, Kicker, Source, Title} from '../../components/ui';
import {C, FONT_TITLE} from '../../themes/theme';

// Cold open. Frame 0: a phone buzzing while renewal notifications pile up and a running total climbs.
// Then the phone's subscription list fills in on the spoken words; the monthly total becomes a year of
// payments; finally the flood of new subscription apps (RevenueCat / Appfigures launch counts).

const ORDER = ['music', 'stream', 'cloud', 'fit', 'tasks', 'ai'] as const;
const WORDS = [/music/i, /streaming/i, /cloud|storage/i, /fitness/i, /productivity/i, /assistant|AI/i];

export const S01ColdOpen: React.FC = () => {
  const b = useBeats();
  const {frame, fps} = b;
  const t = frame / fps;

  // beat 0: notifications cascade from frame 0
  const notes = ORDER.map((k, i) => ({k, at: 0.15 + i * 0.55}));
  const shown = notes.filter((n) => t >= n.at).length;
  const running = notes.slice(0, shown).reduce((a, n) => a + APPS[n.k].price, 0);
  const intro = 1 - b.ramp(1, -0.4, 0.5);

  // beat 1: rows on the words
  const rowT = ORDER.map((_, i) => b.rampAt(b.word(1, WORDS[i], (i + 0.5) / 6), 0.35));
  const listTotal = ORDER.reduce((a, k, i) => a + (rowT[i] > 0.5 ? APPS[k].price : 0), 0);
  const listO = b.during(1, 3);
  const yearT = b.rampAt(b.word(2, /year/i, 0.7), 1.4);

  // beats 4-5: app flood
  const flood = b.during(4, 4);
  const q = b.during(5, 5);
  return (
    <SceneShell drift={[0, 0]} zoom={0.015} fadeIn={false} beatCamera={false}>
      {/* --- beat 0: buzzing phone + renewal notifications (content from frame 0) --- */}
      <div style={{position: 'absolute', inset: 0, opacity: intro}}>
        <Phone x={470} y={600} w={300} tilt={14} buzz={shown < 6 ? (t % 0.55) * 2 : 0} light={false}>
          <div style={{padding: 26, color: C.cream}}>
            <div style={{fontFamily: FONT_TITLE, fontSize: 92, fontWeight: 700, textAlign: 'center', marginTop: 40}}>9:41</div>
            <div style={{textAlign: 'center', fontSize: 28, color: C.muted}}>Tuesday, the 1st</div>
          </div>
        </Phone>
        <div style={{position: 'absolute', left: 880, top: 150, display: 'flex', flexDirection: 'column', gap: 14}}>
          {notes.map((n, i) => {
            const p = interpolate(t - n.at, [0, 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return <Notice key={n.k} app={APPS[n.k]} title={`${APPS[n.k].name} renewed`} body={`${usd(APPS[n.k].price)} charged · monthly plan`} w={640} o={p} ty={(1 - p) * -40} style={{transform: `translateX(${(1 - p) * 120}px)`}} />;
          })}
        </div>
        <Abs x={150} y={140} w={600}>
          <Kicker>This month so far</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96, color: C.orange, fontVariantNumeric: 'tabular-nums'}}>{usd(running)}</div>
        </Abs>
      </div>

      {/* --- beats 1-3: the subscription list --- */}
      <div style={{position: 'absolute', inset: 0, opacity: listO}}>
        <Phone x={500} y={495} w={390} s={0.94 + 0.06 * b.pop(1, -0.3)}>
          <div style={{padding: '10px 0'}}>
            <div style={{padding: '0 24px', fontSize: 26, color: '#6A665F'}}>Settings › Account</div>
            <div style={{padding: '6px 24px 14px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44}}>Subscriptions</div>
            {ORDER.map((k, i) => (
              <SubRow key={k} app={APPS[k]} t={rowT[i]} w={355} priceSuffix="" hi={b.during(1, 1) * (rowT[i] > 0 && rowT[i] < 1 ? 1 : 0)} />
            ))}
          </div>
        </Phone>
        <Abs x={980} y={190} w={820}>
          <Chip bg={C.orange} size={30}>
            HYPOTHETICAL BUNDLE
          </Chip>
          <Kicker>Monthly total</Kicker>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 170, color: C.cream, lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginTop: 8}}>{usd(listTotal)}</div>
          <Body size={36} color={C.muted}>
            none of them feels expensive on its own
          </Body>
        </Abs>
        {/* a year of payments: 12 month tiles fill one after another */}
        <div style={{position: 'absolute', left: 980, top: 560, width: 860, opacity: yearT > 0 ? 1 : 0}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12}}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
              const on = yearT * 12 > i;
              return (
                <div key={m} style={{height: 92, borderRadius: 14, background: on ? 'rgba(245,158,11,0.9)' : C.panel, border: `2px solid ${on ? C.orange : C.line}`, color: on ? C.bg : C.muted, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? 1 : 0.9})`}}>
                  {m}
                  <span style={{fontSize: 26}}>{on ? '$73' : ''}</span>
                </div>
              );
            })}
          </div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 84, color: C.orange, marginTop: 16, fontVariantNumeric: 'tabular-nums'}}>
            {usd(73.45 * 12 * yearT)} <span style={{fontSize: 40, color: C.cream}}>a year</span>
          </div>
        </div>
        {/* beat 3: made-up example stamp */}
        <div style={{position: 'absolute', left: 300, top: 470, opacity: b.during(3, 3), transform: `rotate(-10deg) scale(${1.3 - 0.3 * b.pop(3, 0.2)})`}}>
          <div style={{border: `8px solid ${C.orange}`, color: C.orange, background: 'rgba(17,20,24,0.88)', borderRadius: 18, padding: '10px 30px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64}}>MADE-UP EXAMPLE</div>
        </div>
      </div>

      {/* --- beat 4: the flood of new subscription apps (1 icon = 100 launches) --- */}
      <div style={{position: 'absolute', inset: 0, opacity: flood}}>
        <Source>RevenueCat, State of Subscription Apps 2026 (launch data: Appfigures) · new subscription apps per month</Source>
        {[
          {label: 'January 2022', n: 20, x: 150, w: /2022|twenty/i, at: 0.3, value: '~2,000'},
          {label: 'January 2026', n: 147, x: 690, w: /2026|fourteen/i, at: 0.6, value: '14,700+'},
        ].map((col) => {
          const k = b.rampAt(b.word(4, col.w, col.at, col.n === 20 ? 0 : 1), col.n === 20 ? 0.6 : 2.2);
          const cols = col.n === 20 ? 5 : 21;
          return (
            <div key={col.label} style={{position: 'absolute', left: col.x, top: 210, width: col.n === 20 ? 460 : 1120}}>
              <Kicker>{col.label}</Kicker>
              <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96, color: col.n === 20 ? C.cream : C.orange}}>{col.value}</div>
              <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 44px)`, gap: 8, marginTop: 10}}>
                {Array.from({length: col.n}).map((_, i) => {
                  const a = Object.values(APPS)[i % 8];
                  const on = k * col.n > i;
                  return <AppIcon key={i} app={a} size={44} style={{opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.3})`, boxShadow: 'none'}} />;
                })}
              </div>
            </div>
          );
        })}
        <Abs x={150} y={760} w={1500} o={b.ramp(4, 0.8)}>
          <Body size={30} color={C.muted}>
            launched per month · one icon = 100 apps
          </Body>
        </Abs>
      </div>

      {/* --- beat 5: the question --- */}
      <div style={{position: 'absolute', inset: 0, opacity: q}}>
        <Phone x={1480} y={520} w={340} tilt={-12} s={0.9 + 0.1 * b.pop(5)}>
          <div style={{padding: 30, textAlign: 'center'}}>
            <AppIcon app={APPS.photo} size={130} style={{margin: '40px auto 20px'}} />
            <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40}}>Unlock everything</div>
            <div style={{marginTop: 30, background: APPS.photo.color, color: '#fff', borderRadius: 24, padding: '22px 0', fontWeight: 700, fontSize: 36}}>Subscribe · $9.99/mo</div>
          </div>
        </Phone>
        <Abs x={140} y={300} w={1080}>
          <Title size={100}>
            Why does every app want a <span style={{color: C.orange}}>monthly payment</span>?
          </Title>
          <Body size={44} color={C.cream} style={{marginTop: 30, opacity: b.rampAt(b.word(5, /ahead|who/i, 0.7), 0.4)}}>
            And who actually comes out ahead?
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
