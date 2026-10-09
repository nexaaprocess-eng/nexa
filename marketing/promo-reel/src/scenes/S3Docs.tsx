import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {clamp, E, ev, mix, p, tl, useT, fmt} from '../anim';
import {Reveal} from '../components/Common';
import {AppWindow, Chip, LiveDot} from '../components/Window';
import {Icon} from '../components/Icon';

const WX = 70, WY = 540, WW = 940, WH = 1010;

// Datos ficticios de demostración
const INVOICES = [
  {file: 'FAC-2026-0412.pdf', who: 'Proveedor Demo S.L.', amt: 1240, review: false},
  {file: 'FAC-2026-0413.pdf', who: 'Energía Ejemplo', amt: 389.5, review: false},
  {file: 'FAC-2026-0414.pdf', who: 'Suministros Demo', amt: 2915.75, review: true},
  {file: 'FAC-2026-0415.pdf', who: 'Telefonía Ejemplo', amt: 74.99, review: false},
];
const FOLDERS = [
  {name: 'Clientes', icon: 'users'},
  {name: 'Facturas', icon: 'file'},
  {name: 'Proveedores', icon: 'truck'},
  {name: 'Soporte', icon: 'alert'},
];
const MAILS = [
  {av: 'LG', who: 'Laura Gómez', sub: 'Presupuesto para la reforma', time: '09:41', f: 0},
  {av: 'PD', who: 'Proveedor Demo S.L.', sub: 'Factura FAC-0418 adjunta', time: '09:38', f: 1},
  {av: 'TE', who: 'Transportes Ejemplo', sub: 'Confirmación de envío #2291', time: '09:30', f: 2},
  {av: 'CM', who: 'Carlos Martín', sub: 'No puedo acceder a mi pedido', time: '09:12', f: 3},
  {av: 'PE', who: 'Papelería Ejemplo', sub: 'Factura de septiembre', time: '08:57', f: 1},
];

const CARD_H = 150, CARD_G = 18, CARD_Y0 = 96;

const InvoiceView: React.FC<{t: number}> = ({t}) => {
  const scanStart = ev.s3_scan, scanDur = 1.5;
  const scanY = CARD_Y0 + p(t, scanStart, scanDur, E.inOutSine) * (4 * (CARD_H + CARD_G));
  const scanning = t > scanStart && t < scanStart + scanDur + 0.2;
  const done = INVOICES.filter((_, i) => t > ev.s3_state[i]).length;
  return (
    <div style={{position: 'absolute', inset: 0, padding: '0 36px'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 90}}>
        <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 30, color: C.white}}>Bandeja de facturas</div>
        <Chip tone="muted">{Math.min(4, INVOICES.filter((_, i) => t > ev.s3_pdf[i]).length)} nuevas</Chip>
      </div>
      {INVOICES.map((inv, i) => {
        const at = ev.s3_pdf[i];
        const v = p(t, at, 0.55, E.outQuint);
        const y = CARD_Y0 + i * (CARD_H + CARD_G);
        const scanned = clamp((scanY - y - 20) / 60);
        const st = ev.s3_state[i];
        const processed = t > st;
        const flash = Math.max(0, 1 - Math.abs(t - st) / 0.25);
        const ok = processed && !inv.review;
        return (
          <div key={i} style={{
            position: 'absolute', left: 36, right: 36, top: y, height: CARD_H, borderRadius: 26,
            background: `linear-gradient(90deg, rgba(0,168,107,${0.1 * flash + (ok ? 0.06 : 0)}), rgba(255,255,255,.035))`,
            border: `1.5px solid ${ok ? 'rgba(61,220,151,.5)' : processed ? 'rgba(242,184,75,.45)' : 'rgba(255,255,255,.08)'}`,
            boxShadow: ok ? `0 0 ${30 + flash * 30}px -10px rgba(0,168,107,.7)` : 'none',
            display: 'flex', alignItems: 'center', gap: 24, padding: '0 26px',
            opacity: v, transform: `translate(${(1 - v) * 420}px, ${(1 - v) * -260}px) rotate(${(1 - v) * 14}deg) scale(${mix(0.8, 1, v)})`,
          }}>
            <div style={{width: 78, height: 96, borderRadius: 14, background: 'rgba(255,255,255,.92)', position: 'relative',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12, flexShrink: 0}}>
              {[0, 1, 2].map((l) => <div key={l} style={{position: 'absolute', left: 14, right: l === 2 ? 30 : 14, top: 18 + l * 12, height: 5, borderRadius: 3, background: '#C9D3CF'}} />)}
              <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 18, color: '#fff', background: C.green, borderRadius: 6, padding: '2px 8px'}}>PDF</span>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.white}}>{inv.file}</div>
              <div style={{fontFamily: F.body, fontSize: 22, color: C.text2, marginTop: 6}}>
                {inv.who}
                <span style={{opacity: scanned, color: C.green300, marginLeft: 12, fontWeight: 600}}>· {fmt(inv.amt, 2)} €</span>
              </div>
              <div style={{display: 'flex', gap: 10, marginTop: 10, opacity: scanned, transform: `translateY(${(1 - scanned) * 8}px)`}}>
                {['Proveedor', 'Importe', 'Fecha'].map((f) => (
                  <span key={f} style={{fontFamily: F.body, fontSize: 17, color: C.text2, display: 'flex', alignItems: 'center', gap: 4}}>
                    <Icon name="check" size={16} color={C.green300} stroke={3} />{f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{position: 'relative', width: 190, height: 50, flexShrink: 0}}>
              {[
                {on: scanned < 1, el: <Chip tone="muted">Pendiente</Chip>},
                {on: scanned >= 1 && !processed, el: <Chip tone="green"><Icon name="file" size={18} />Factura</Chip>},
                {on: processed && !inv.review, el: <Chip tone="solid"><Icon name="check" size={18} stroke={3} />Procesada</Chip>},
                {on: processed && inv.review, el: <Chip tone="amber"><Icon name="search" size={18} />Revisión</Chip>},
              ].map((c, k) => (
                <div key={k} style={{position: 'absolute', right: 0, top: 4, opacity: c.on ? 1 : 0,
                  transform: c.on ? 'scale(1)' : 'scale(.85)', transition: 'none'}}>{c.el}</div>
              ))}
            </div>
          </div>
        );
      })}
      {/* haz de escaneo de la IA */}
      {scanning && (
        <div style={{position: 'absolute', left: 20, right: 20, top: scanY - 2, height: 4, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${C.green300}, #fff, ${C.green300}, transparent)`,
          boxShadow: `0 0 30px 8px rgba(61,220,151,.55)`}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 4, height: 90,
            background: 'linear-gradient(0deg, rgba(61,220,151,.18), transparent)'}} />
        </div>
      )}
      {/* destinos */}
      <div style={{position: 'absolute', left: 36, right: 36, top: CARD_Y0 + 4 * (CARD_H + CARD_G) + 18, display: 'flex', gap: 16}}>
        {[{n: 'Contabilidad', i: 'calc', c: [0, 1, 3]}, {n: 'Archivo', i: 'folder', c: [0, 1, 3]}, {n: 'Revisión', i: 'search', c: [2]}].map((d, k) => {
          const count = d.c.filter((j) => t > ev.s3_state[j]).length;
          const hit = d.c.some((j) => Math.abs(t - ev.s3_state[j] - 0.1) < 0.2);
          return (
            <div key={k} style={{flex: 1, height: 120, borderRadius: 24, border: `1.5px dashed ${count ? 'rgba(61,220,151,.45)' : 'rgba(255,255,255,.12)'}`,
              background: hit ? 'rgba(0,168,107,.14)' : 'rgba(255,255,255,.02)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px'}}>
              <Icon name={d.i} size={34} color={count ? C.green300 : C.text3} stroke={1.8} />
              <div>
                <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 22, color: C.white}}>{d.n}</div>
                <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 30, color: count ? C.green300 : C.text3}}>{count}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 36, right: 36, bottom: 26, display: 'flex', justifyContent: 'space-between',
        fontFamily: F.body, fontSize: 21, color: C.text3}}>
        <span>Procesadas {done}/4</span><span>Tiempo total: {done ? fmt(Math.min(2.1, (t - ev.s3_scan) * 0.9), 1) : '0,0'} s</span>
      </div>
    </div>
  );
};

const ROW_H = 132, ROW_Y0 = 230;
const MailView: React.FC<{t: number}> = ({t}) => {
  const tabW = (WW - 72 - 3 * 12) / 4;
  const sortP = MAILS.map((_, i) => p(t, ev.s3_sort[i], 0.5, E.inOutCubic));
  return (
    <div style={{position: 'absolute', inset: 0, padding: '0 36px'}}>
      <div style={{display: 'flex', gap: 12, marginTop: 28}}>
        {FOLDERS.map((f, k) => {
          const n = MAILS.filter((m, i) => m.f === k && sortP[i] >= 0.95).length;
          const hit = MAILS.some((m, i) => m.f === k && Math.abs(t - ev.s3_sort[i] - 0.5) < 0.18);
          return (
            <div key={k} style={{width: tabW, height: 120, borderRadius: 22, padding: '16px 18px',
              background: hit ? 'rgba(0,168,107,.22)' : 'rgba(255,255,255,.035)',
              border: `1.5px solid ${n ? 'rgba(61,220,151,.45)' : 'rgba(255,255,255,.08)'}`,
              transform: `scale(${hit ? 1.05 : 1})`}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Icon name={f.icon} size={30} color={n ? C.green300 : C.text2} stroke={1.8} />
                <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 30, color: n ? C.green300 : C.text3}}>{n}</span>
              </div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 21, color: C.white, marginTop: 14}}>{f.name}</div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 34}}>
        <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 30, color: C.white}}>Entrada</div>
        <Chip tone="green"><Icon name="sparkle" size={18} />Clasificación automática</Chip>
      </div>
      {MAILS.map((m, i) => {
        const v = p(t, ev.s3_mailIn[i], 0.45, E.outQuint);
        const before = sortP.slice(0, i).reduce((a, b) => a + b, 0);
        const y = ROW_Y0 + 70 + (i - before) * ROW_H;
        const s = sortP[i];
        const tagOn = p(t, ev.s3_sort[i] - 0.3, 0.2);
        const fx = 36 + m.f * (tabW + 12) + tabW / 2 - WW / 2;
        return (
          <div key={i} style={{position: 'absolute', left: 36, right: 36, top: y, height: ROW_H - 14, borderRadius: 22,
            background: `rgba(255,255,255,${0.035 + tagOn * 0.03})`, border: `1.5px solid rgba(${tagOn ? '61,220,151,.35' : '255,255,255,.07'})`,
            display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px',
            opacity: v * (1 - E.inCubic(clamp(s * 1.4 - 0.4))),
            transform: `translate(${fx * s}px, ${(1 - v) * -40 + s * (88 - (y + (ROW_H - 14) / 2))}px) scale(${mix(1, 0.25, s)})`,
            transformOrigin: '50% 50%'}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: `rgba(0,168,107,${0.18 + (i % 2) * 0.1})`, color: C.green300,
              display: 'grid', placeItems: 'center', fontFamily: F.head, fontWeight: 700, fontSize: 22, flexShrink: 0}}>{m.av}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 25, color: C.white}}>{m.who}</span>
                <span style={{fontFamily: F.body, fontSize: 19, color: C.text3}}>{m.time}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 6}}>
                <span style={{fontFamily: F.body, fontSize: 21, color: C.text2, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.sub}</span>
                <span style={{opacity: tagOn, transform: `scale(${mix(0.7, 1, tagOn)})`}}>
                  <Chip tone="green" style={{fontSize: 18, padding: '5px 12px'}}>{FOLDERS[m.f].name}</Chip>
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {/* bandeja vacía */}
      <div style={{position: 'absolute', left: 0, right: 0, top: ROW_Y0 + 230, textAlign: 'center',
        opacity: p(t, ev.s3_sort[4] + 0.45, 0.4), transform: `scale(${mix(0.9, 1, p(t, ev.s3_sort[4] + 0.45, 0.5, E.outBack))})`}}>
        <div style={{width: 110, height: 110, borderRadius: 55, margin: '0 auto 22px', background: 'rgba(0,168,107,.16)',
          border: `2px solid ${C.green300}`, display: 'grid', placeItems: 'center', boxShadow: '0 0 50px rgba(0,168,107,.5)'}}>
          <Icon name="check" size={56} color={C.green300} stroke={2.6} />
        </div>
        <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 34, color: C.white}}>Bandeja organizada</div>
        <div style={{fontFamily: F.body, fontSize: 22, color: C.text2, marginTop: 8}}>5 correos clasificados en 1,4 s</div>
      </div>
    </div>
  );
};

export const S3Docs: React.FC = () => {
  const t = useT();
  const [start, end] = tl.scenes.s3;
  const enter = p(t, start, 0.9, E.outQuart);
  const exit = p(t, end - 0.4, 0.4, E.inCubic);
  const sw = p(t, ev.s3_toMail, 0.55, E.inOutQuart);
  const drift = p(t, start, end - start, E.inOutSine);
  const rotY = mix(-16, 0, enter) + Math.sin(sw * Math.PI) * -7 + mix(0, 3, drift);
  const rotX = mix(22, 4, enter) - drift * 2;
  return (
    <AbsoluteFill style={{opacity: 1 - exit}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230}}>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: 1 - p(t, ev.s3_toMail, 0.3, E.inCubic)}}>
          <Reveal text={'Facturas que se\nprocesan solas'} at={start + 0.35} size={74} accent={['solas']} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0}}>
          <Reveal text={'Correos que se\norganizan solos'} at={ev.s3_toMail + 0.2} size={74} accent={['solos']} />
        </div>
      </div>
      <div style={{position: 'absolute', left: WX, top: WY, perspective: 1800, perspectiveOrigin: '50% 30%'}}>
        <div style={{
          transform: `translateY(${(1 - enter) * 520 - exit * 200}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${mix(0.86, 1, enter) * mix(1, 1.04, drift) * (1 - exit * 0.1)})`,
          opacity: enter, transformStyle: 'preserve-3d',
        }}>
          <AppWindow width={WW} height={WH}
            title={<>
              <span style={{position: 'absolute', opacity: 1 - sw, transform: `translateY(${-sw * 20}px)`}}>Nexa Flow · Facturas</span>
              <span style={{position: 'absolute', opacity: sw, transform: `translateY(${(1 - sw) * 20}px)`}}>Nexa Flow · Correo</span>
            </>}
            right={<Chip tone="green" style={{fontSize: 20}}><LiveDot t={t} />Automático</Chip>}>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${-sw * 100}%)`, opacity: 1 - sw * 0.8}}>
              <InvoiceView t={t} />
            </div>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - sw) * 100}%)`, opacity: 0.2 + sw * 0.8}}>
              {sw > 0 && <MailView t={t} />}
            </div>
          </AppWindow>
        </div>
      </div>
    </AbsoluteFill>
  );
};
