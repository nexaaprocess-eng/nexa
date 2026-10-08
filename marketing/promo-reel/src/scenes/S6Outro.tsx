import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {E, ev, mix, p, tl, useT} from '../anim';
import {Glow, Reveal} from '../components/Common';
import {Logo} from '../components/Logo';

const LW = 800, LX = (1080 - LW) / 2, LCY = 830, LT = LCY - (LW * 310) / 785 / 2;

export const S6Outro: React.FC = () => {
  const t = useT();
  const [start] = tl.scenes.s6;
  const L = ev.s6_logo;
  const line = p(t, ev.s6_line, 0.7, E.inOutCubic);
  const green = p(t, ev.s6_line + 0.62, 0.3);
  const halo = p(t, ev.s6_line + 0.4, 1.6, E.outCubic) * (0.88 + 0.12 * Math.sin((t - L) * 1.8));
  const endPulse = Math.max(0, 1 - Math.abs(t - ev.s6_end) / 0.6);
  const push = mix(0.97, 1.03, p(t, start, tl.total - start, E.outCubic));
  // chispa que recorre el trazo
  const GREEN = [[350, 0], [405, 0], [565, 190], [510, 190], [350, 0]];
  const lens = GREEN.slice(1).map((q, i) => Math.hypot(q[0] - GREEN[i][0], q[1] - GREEN[i][1]));
  const tot = lens.reduce((a, b) => a + b, 0);
  let d = line * tot, k = 0;
  while (k < lens.length - 1 && d > lens[k]) d -= lens[k++];
  const a = GREEN[k], b = GREEN[k + 1], f = Math.min(1, d / lens[k]);
  const S = LW / 785;
  const spark = {x: LX + (mix(a[0], b[0], f) + 10) * S, y: LT + (mix(a[1], b[1], f) + 10) * S};

  return (
    <AbsoluteFill style={{opacity: p(t, start, 0.4)}}>
      <Glow x={540} y={LCY} r={820} o={0.75 * halo + endPulse * 0.35} />
      <Glow x={540} y={LCY} r={360} o={0.35 * halo + endPulse * 0.3} color="61,220,151" />
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <div style={{position: 'absolute', left: LX, top: LT}}>
          <Logo id="s6" width={LW} line={line} green={green} bar={p(t, L, 0.55, E.outQuart)}
            letters={p(t, L + 0.1, 0.9, E.linear)} process={p(t, L + 0.55, 0.8)}
            glow={0.55 + 0.35 * halo + endPulse * 0.4} sweep={p(t, ev.s6_end - 0.75, 1.1, E.inOutSine)} />
        </div>
        {line > 0 && line < 1 && (
          <div style={{position: 'absolute', left: spark.x - 7, top: spark.y - 7, width: 14, height: 14, borderRadius: 7, background: '#fff',
            boxShadow: `0 0 20px 8px ${C.green300}, 0 0 60px 20px rgba(0,168,107,.6)`}} />
        )}
        <div style={{position: 'absolute', left: 0, right: 0, top: LCY + 250}}>
          <div style={{margin: '0 auto 44px', width: 520 * p(t, ev.s6_claim1 - 0.35, 0.9, E.inOutCubic), height: 2,
            background: `linear-gradient(90deg, transparent, ${C.green300}, transparent)`}} />
          <Reveal text="Automatizamos el trabajo." at={ev.s6_claim1} size={56} weight={700} tracking="0.02em" stagger={0.09} />
          <div style={{height: 14}} />
          <Reveal text="Impulsamos tu negocio." at={ev.s6_claim2} size={56} weight={700} tracking="0.02em" stagger={0.09}
            color={C.green300} style={{textShadow: '0 0 30px rgba(0,168,107,.55)'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', fontFamily: F.body, fontWeight: 500,
          fontSize: 30, letterSpacing: '0.24em', color: C.text2, opacity: p(t, ev.s6_end - 0.4, 0.8),
          transform: `translateY(${(1 - p(t, ev.s6_end - 0.4, 0.8)) * 14}px)`}}>NEXAPROCESS.ES</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
