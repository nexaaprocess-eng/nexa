import React from 'react';
import {Box, Jacket, Place} from '../components/icons';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Card, Illustrative, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_BODY, FONT_TITLE} from '../themes/theme';

const OPS = ['Return shipping', 'Labor: receive · open · inspect', 'Cleaning · repacking · re-tagging', 'Customer service time', 'Software & fraud checks'];

const Pile: React.FC<{title: string; sub: string; color: string; highlight: number; children?: React.ReactNode}> = ({title, sub, color, highlight, children}) => (
  <div
    style={{
      width: 700,
      height: 640,
      borderRadius: 24,
      border: `3px solid ${highlight > 0.5 ? color : C.line}`,
      background: `rgba(29,34,41,${0.5 + 0.4 * highlight})`,
      padding: 34,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      transform: `scale(${0.96 + 0.04 * highlight})`,
      opacity: 0.45 + 0.55 * highlight,
    }}
  >
    <div style={{fontFamily: FONT_TITLE, fontSize: 54, fontWeight: 700, color}}>{title}</div>
    <div style={{fontFamily: FONT_BODY, fontSize: 28, color: C.muted, marginTop: 6}}>{sub}</div>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12}}>{children}</div>
  </div>
);

export const S04Costs: React.FC = () => {
  const b = useBeats();
  const {frame} = b;

  const pilesO = b.during(0, 4);
  const hlOps = Math.max(b.during(1, 2), b.ramp(0, 0.4) * (1 - b.ramp(1, 0, 0.01)));
  const hlVal = Math.max(b.during(3, 4), b.ramp(0, 0.4) * (1 - b.ramp(1, 0, 0.01)));

  // illustrative ledger, synced to the spoken figures
  const f100 = b.word(6, /100/, 0.15);
  const f8 = b.word(6, /^\$?8/, 0.45);
  const f6 = b.word(6, /^\$?6/, 0.62);
  const f70 = b.word(6, /70/, 0.92);
  const rows = [
    {l: 'Jacket sold for', v: '$100', f: f100, c: C.cream},
    {l: 'Return shipping (seller pays)', v: '− $8', f: f8, c: C.red},
    {l: 'Handling', v: '− $6', f: f6, c: C.red},
    {l: 'Resale value, out of season', v: '$70', f: f70, c: C.orange},
  ];
  const f14 = b.word(7, /14/, 0.35);
  const f30 = b.word(7, /30/, 0.55);
  const f44 = b.word(7, /44/, 0.85);
  const exampleO = b.during(5, 8);

  return (
    <SceneShell drift={[0, -8]} zoom={0.02}>
      {/* ---------- two piles */}
      <div style={{position: 'absolute', inset: 0, opacity: pilesO}}>
        <Abs x={190} y={170}>
          <Pile title="Operating costs" sub="money spent moving & handling the item" color={C.red} highlight={Math.max(hlOps, b.during(0, 0))}>
            {OPS.map((o, i) => {
              const t = b.popAt(b.at(2) + Math.round((b.end(2) - b.at(2)) * (i / OPS.length)));
              return (
                <div
                  key={o}
                  style={{
                    background: C.red,
                    color: C.bg,
                    fontFamily: FONT_TITLE,
                    fontWeight: 700,
                    fontSize: 32,
                    padding: '16px 22px',
                    borderRadius: 12,
                    opacity: t,
                    transform: `translateY(${-140 * (1 - t)}px)`,
                  }}
                >
                  {o}
                </div>
              );
            }).reverse()}
          </Pile>
        </Abs>
        <Abs x={1030} y={170}>
          <Pile title="Lost value" sub="what the item is no longer worth" color={C.orange} highlight={Math.max(hlVal, b.during(0, 0))}>
            <div style={{opacity: b.during(4, 4), display: 'flex', flexDirection: 'column', gap: 18}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: b.ramp(4, 0.4)}}>
                <svg width={150} height={150} viewBox="-120 -120 240 240">
                  <Jacket fill={C.green} />
                </svg>
                <div>
                  <div style={{fontFamily: FONT_TITLE, fontSize: 34, fontWeight: 700, color: C.green}}>Perfect, in season</div>
                  <div style={{fontFamily: FONT_BODY, fontSize: 28, color: C.cream}}>may resell at full price</div>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: b.ramp(4, 4.5)}}>
                <svg width={150} height={150} viewBox="-120 -120 240 240">
                  <Jacket fill="#8C7F6E" />
                </svg>
                <div>
                  <div style={{fontFamily: FONT_TITLE, fontSize: 34, fontWeight: 700, color: C.red}}>Late · no tags · worn</div>
                  <div style={{fontFamily: FONT_BODY, fontSize: 28, color: C.cream}}>marked down, or sold off in bulk</div>
                </div>
              </div>
            </div>
          </Pile>
        </Abs>
      </div>

      {/* ---------- illustrative example (clearly labelled) */}
      <div style={{position: 'absolute', inset: 0, opacity: exampleO}}>
        <Illustrative />
        {/* ledger rows */}
        <Abs x={190} y={250} w={760} o={1 - b.ramp(8, 0, 0.4)}>
          <Card w={760} accent={C.orange} pad={34}>
            <Kicker>Hypothetical $100 jacket</Kicker>
            {rows.map((r) => {
              const t = b.rampAt(r.f, 0.4);
              return (
                <div key={r.l} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `2px solid ${C.line}`, padding: '18px 0', opacity: 0.15 + 0.85 * t}}>
                  <span style={{fontFamily: FONT_BODY, fontSize: 32, color: C.cream}}>{r.l}</span>
                  <span style={{fontFamily: FONT_TITLE, fontSize: 48, fontWeight: 700, color: r.c}}>{r.v}</span>
                </div>
              );
            })}
          </Card>
        </Abs>
        {/* waterfall */}
        <Abs x={1050} y={250} w={700} o={b.during(7, 7)}>
          <Kicker color={C.cream}>The seller’s side of this one return</Kicker>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, height: 420, marginTop: 30}}>
            {[
              {l: 'spent', v: 14, f: f14, c: C.red, off: 0},
              {l: 'value lost', v: 30, f: f30, c: C.orange, off: 14},
              {l: 'total', v: 44, f: f44, c: C.cream, off: 0},
            ].map((d) => {
              const t = b.rampAt(d.f, 0.5);
              return (
                <div key={d.l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 170}}>
                  <div style={{fontFamily: FONT_TITLE, fontSize: 56, fontWeight: 700, color: d.c, opacity: t}}>${d.v}</div>
                  <div style={{width: 130, height: d.v * 7 * t, background: d.c, borderRadius: 8, marginBottom: d.off * 7}} />
                  <div style={{fontFamily: FONT_BODY, fontSize: 28, color: C.muted, marginTop: 10}}>{d.l}</div>
                </div>
              );
            })}
          </div>
        </Abs>
        {/* assumptions dials */}
        <div style={{opacity: b.during(8, 8)}}>
          <Abs x={0} y={250} w={1920} align="center">
            <Title size={60}>Change an assumption, change the answer</Title>
          </Abs>
          <Abs x={160} y={420} w={1600}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              {['Product', 'Carrier contract', 'Warehouse', 'Item condition'].map((d, i) => {
                const rot = Math.sin(frame / (14 + i * 3) + i) * 70;
                return (
                  <div key={d} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity: b.ramp(8, 0.5 + i * 0.6)}}>
                    <svg width={220} height={220} viewBox="-110 -110 220 220">
                      <circle r={90} fill={C.panel} stroke={C.line} strokeWidth={8} />
                      <path d="M-70 50 A86 86 0 1 1 70 50" fill="none" stroke={C.orange} strokeWidth={10} strokeLinecap="round" opacity={0.4} />
                      <line x1={0} y1={0} x2={0} y2={-70} stroke={C.cream} strokeWidth={10} strokeLinecap="round" transform={`rotate(${rot})`} />
                      <circle r={12} fill={C.orange} />
                    </svg>
                    <div style={{fontFamily: FONT_TITLE, fontSize: 34, color: C.cream, fontWeight: 600}}>{d}</div>
                  </div>
                );
              })}
            </div>
          </Abs>
        </div>
      </div>

      {/* ---------- fraud */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(9, 9)}}>
        <Source>NRF & Happy Returns, 2025 Retail Returns Landscape · retailers that track fraud; excludes bracketing & wardrobing</Source>
        <Stage>
          {Array.from({length: 100}).map((_, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const bad = [3, 17, 28, 41, 55, 62, 76, 84, 98].includes(i);
            const t = b.ramp(9, 0.3 + (i / 100) * 1.2, 0.3);
            return (
              <g key={i} opacity={t}>
                <Place x={250 + col * 64} y={240 + row * 62} s={0.26}>
                  <Box fill={bad && b.frame > b.word(9, /^9/, 0.3) ? C.red : '#C8A675'} />
                </Place>
              </g>
            );
          })}
        </Stage>
        <Abs x={1000} y={270} w={760}>
          <Kicker color={C.red}>Return fraud, retailers’ estimate</Kicker>
          <Title size={190} color={C.red} style={{marginTop: 6}}>
            ~9%
          </Title>
          <Body size={36} style={{marginTop: 6}}>
            of returns, from empty boxes to swapped items
          </Body>
          <Body size={26} color={C.muted} style={{marginTop: 22, opacity: b.ramp(9, 6)}}>
            Self-reported by retailers that track it · not audited · illustration shows 9 in 100
          </Body>
        </Abs>
      </div>
    </SceneShell>
  );
};
