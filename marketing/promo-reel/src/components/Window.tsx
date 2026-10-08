import React from 'react';
import {C, F} from '../theme';

/** Ventana de aplicación de cristal oscuro. */
export const AppWindow: React.FC<{
  title: React.ReactNode; right?: React.ReactNode; width: number; height: number; style?: React.CSSProperties; children: React.ReactNode;
}> = ({title, right, width, height, style, children}) => (
  <div style={{
    width, height, borderRadius: 38, position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(10,30,22,.92), rgba(4,14,10,.94))',
    border: `1.5px solid rgba(61,220,151,.22)`,
    boxShadow: '0 60px 120px -40px rgba(0,0,0,.9), 0 0 80px -20px rgba(0,168,107,.35), inset 0 1px 0 rgba(255,255,255,.08)',
    ...style,
  }}>
    <div style={{height: 84, display: 'flex', alignItems: 'center', padding: '0 34px', gap: 14,
      borderBottom: `1px solid ${C.line}`, background: 'rgba(255,255,255,.02)'}}>
      {['#2B3D35', '#2B3D35', '#2B3D35'].map((c, i) => <span key={i} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
      <div style={{marginLeft: 14, fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.white, flex: 1, position: 'relative', height: 34}}>{title}</div>
      {right}
    </div>
    <div style={{position: 'absolute', top: 84, left: 0, right: 0, bottom: 0}}>{children}</div>
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; tone?: 'green' | 'amber' | 'muted' | 'solid'; style?: React.CSSProperties}> = ({children, tone = 'green', style}) => {
  const t = {
    green: {bg: 'rgba(0,168,107,.16)', bd: 'rgba(61,220,151,.45)', fg: C.green300},
    solid: {bg: C.green, bd: C.green, fg: '#fff'},
    amber: {bg: 'rgba(242,184,75,.12)', bd: 'rgba(242,184,75,.45)', fg: C.amber},
    muted: {bg: 'rgba(255,255,255,.05)', bd: 'rgba(255,255,255,.14)', fg: C.text2},
  }[tone];
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
      background: t.bg, border: `1.5px solid ${t.bd}`, color: t.fg, fontFamily: F.body, fontWeight: 600, fontSize: 21,
      whiteSpace: 'nowrap', ...style}}>{children}</span>
  );
};

export const LiveDot: React.FC<{t: number; color?: string}> = ({t, color = C.green300}) => (
  <span style={{position: 'relative', width: 12, height: 12, display: 'inline-block'}}>
    <span style={{position: 'absolute', inset: 0, borderRadius: 6, background: color}} />
    <span style={{position: 'absolute', inset: 0, borderRadius: 6, border: `2px solid ${color}`,
      transform: `scale(${1 + (t * 1.2 % 1) * 1.8})`, opacity: 1 - (t * 1.2 % 1)}} />
  </span>
);
