import React from 'react';
import {Box, Invoice, Mailbox, Person, Place, Store, Tag, Warehouse, Truck} from '../components/icons';
import {SceneShell} from '../components/SceneShell';
import {useBeats} from '../components/timeline';
import {Abs, Body, Card, HBar, Kicker, Source, Stage, Title} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';

const SRC = {x: 300, y: 560};
const PAYERS = [
  {id: 'retailer', l: 'Retailer', y: 300, icon: <Store />},
  {id: 'seller', l: 'Marketplace seller', y: 470, icon: <Warehouse />},
  {id: 'logistics', l: 'Logistics partner', y: 640, icon: <Truck />},
  {id: 'shopper', l: 'Shopper', y: 810, icon: <Person />},
];
const NODE_X = 800;

type Case = {k: string; title: string; body: string; flows: Record<string, number>; dashed?: string[]; color: string};
const CASES: Record<number, Case> = {
  1: {k: 'Case 1', title: 'A retailer selling its own products', body: 'typically absorbs the cost of a free return directly, at least at first', flows: {retailer: 1}, color: C.orange},
  2: {k: 'Case 2', title: 'A marketplace with independent sellers', body: 'platform rules split the cost; some charge sellers return-related fees', flows: {retailer: 0.5, seller: 0.8}, color: C.orange},
  3: {k: 'Case 2 · example', title: 'Amazon’s fulfillment service', body: 'has charged returns processing fees on some products; rules vary by category and have changed over time', flows: {retailer: 0.5, seller: 0.8}, color: C.orange},
  4: {k: 'Case 3', title: 'Logistics partners', body: 'carriers and returns companies are paid for their work: they bill for it, under contracts the public rarely sees', flows: {retailer: 0.6, logistics: 0}, color: C.blue},
  5: {k: 'Case 4', title: 'The shopper', body: 'not always via a fee on that return, but possibly via prices, shipping charges or memberships. Hard to measure from outside', flows: {retailer: 0.6}, dashed: ['shopper'], color: C.red},
};

export const S05WhoPays: React.FC = () => {
  const b = useBeats();
  const {frame} = b;
  const segIdx = Math.max(0, b.ctx.segStart.filter((s) => s <= frame).length - 1);
  const c = CASES[segIdx];
  const diagramO = b.during(0, 5);
  const caseT = c ? b.ramp(segIdx, 0.1, 0.5) : 0;

  return (
    <SceneShell drift={[0, -6]} zoom={0.02}>
      {/* ---------- flow diagram */}
      <div style={{position: 'absolute', inset: 0, opacity: diagramO}}>
        <Stage>
          {/* source node */}
          <Place x={SRC.x} y={SRC.y - 40} s={0.9 * b.pop(0, 0.2)}>
            <Box label="RETURN" />
          </Place>
          <text x={SRC.x} y={SRC.y + 110} textAnchor="middle" fill={C.red} fontFamily="Space Grotesk" fontWeight={700} fontSize={34}>
            the cost of a free return
          </text>
          {PAYERS.map((p, i) => {
            const on = b.ramp(0, 1.2 + i * 0.4, 0.5);
            const w = c?.flows[p.id] ?? 0;
            const dashed = c?.dashed?.includes(p.id);
            const lit = w > 0 || dashed || (segIdx === 4 && p.id === 'logistics');
            const d = `M${SRC.x + 110} ${SRC.y} C ${SRC.x + 300} ${SRC.y}, ${NODE_X - 260} ${p.y}, ${NODE_X - 90} ${p.y}`;
            return (
              <g key={p.id} opacity={on}>
                <path d={d} fill="none" stroke={C.line} strokeWidth={6} />
                {w > 0 && <path d={d} fill="none" stroke={c.color} strokeWidth={6 + 34 * w * caseT} strokeLinecap="round" opacity={0.9} />}
                {dashed && <path d={d} fill="none" stroke={C.red} strokeWidth={10} strokeDasharray="18 18" strokeDashoffset={-frame * 2} opacity={caseT} />}
                <rect x={NODE_X - 90} y={p.y - 60} width={460} height={120} rx={18} fill={C.panel} stroke={lit ? (c?.color ?? C.cream) : C.line} strokeWidth={lit ? 5 : 3} />
                <Place x={NODE_X - 20} y={p.y} s={0.42}>
                  {p.icon}
                </Place>
                <text x={NODE_X + 46} y={p.y + 12} fill={C.cream} fontSize={32} fontFamily="Space Grotesk" fontWeight={700}>
                  {p.l}
                </text>
              </g>
            );
          })}
          {/* case 2/3: fee arrow seller -> platform */}
          <g opacity={segIdx === 2 || segIdx === 3 ? caseT : 0}>
            <path d={`M${NODE_X + 375} 470 C ${NODE_X + 440} 470, ${NODE_X + 440} 300, ${NODE_X + 375} 300`} fill="none" stroke={C.orange} strokeWidth={6} markerEnd="url(#arrow)" />
            <text x={NODE_X + 425} y={395} fill={C.orange} fontSize={26} fontFamily="Inter" fontWeight={700}>
              fees
            </text>
          </g>
          {/* case 3: invoice back to retailer */}
          <g opacity={segIdx === 4 ? caseT : 0}>
            <Place x={NODE_X + 420} y={640} s={0.45} r={8}>
              <Invoice />
            </Place>
            <path d={`M${NODE_X + 375} 600 C ${NODE_X + 460} 560, ${NODE_X + 460} 340, ${NODE_X + 375} 320`} fill="none" stroke={C.blue} strokeWidth={6} markerEnd="url(#arrowBlue)" />
          </g>
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill={C.orange} />
            </marker>
            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill={C.blue} />
            </marker>
          </defs>
        </Stage>
        {/* case card */}
        <Abs x={1330} y={240} w={500} o={b.during(0, 0)}>
          <Title size={60}>So, who pays?</Title>
          <Body size={34} color={C.muted} style={{marginTop: 18}}>
            It depends on who’s in the chain.
          </Body>
        </Abs>
        {c && (
          <Abs x={1330} y={240} w={500} o={caseT} tx={30 * (1 - caseT)}>
            <Card w={500} accent={c.color}>
              <Kicker color={c.color}>{c.k}</Kicker>
              <Title size={46} style={{marginTop: 12}}>
                {c.title}
              </Title>
              <Body size={30} color={C.cream} style={{marginTop: 16}}>
                {c.body}
              </Body>
            </Card>
          </Abs>
        )}
        {segIdx === 3 && (
          <Source>Amazon Seller Central announcements on FBA returns processing fees (2024–2025); check current rate card</Source>
        )}
      </div>

      {/* ---------- 66% -> 72% */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(6, 6)}}>
        <Source>NRF & Happy Returns, 2025 Retail Returns Landscape · survey of 358 large U.S. retailers</Source>
        <Abs x={260} y={300} w={1400}>
          <Kicker>Merchants that started charging for at least one return option (past 12 months)</Kicker>
          <div style={{marginTop: 40}}>
            <HBar label="2024 survey" value={66} max={100} t={b.rampAt(b.word(6, /66/, 0.85), 0.7)} valueText="66%" color={C.line} w={1400} h={80} />
            <HBar label="2025 survey" value={72} max={100} t={b.rampAt(b.word(6, /72/, 0.45), 0.7)} valueText="72%" color={C.red} w={1400} h={80} />
          </div>
        </Abs>
      </div>

      {/* ---------- routing between return methods */}
      <div style={{position: 'absolute', inset: 0, opacity: b.during(7, 7)}}>
        <Stage>
          <Place x={360} y={560} s={1.1}>
            <Person fill={C.cream} />
          </Place>
          <Place x={1150} y={400} s={0.9 * b.pop(7, 0.3)}>
            <Mailbox />
          </Place>
          <Place x={1150} y={700} s={0.9 * b.pop(7, 0.9)}>
            <Store />
          </Place>
          <path d="M460 540 C 700 520, 800 420, 1040 410" fill="none" stroke={C.line} strokeWidth={6} strokeDasharray="14 14" />
          <path d="M460 580 C 700 600, 800 690, 1040 700" fill="none" stroke={C.green} strokeWidth={10 + 10 * b.ramp(7, 2.5, 1)} strokeLinecap="round" />
          <Place x={760 + 260 * ((frame / 60) % 1)} y={600 + 120 * ((frame / 60) % 1)} s={0.22}>
            <Box />
          </Place>
          <Place x={1400} y={400} s={0.5 * b.pop(7, 1.2)} r={-6}>
            <Tag text="FEE" fill={C.red} textColor={C.cream} />
          </Place>
          <Place x={1400} y={700} s={0.5 * b.pop(7, 1.6)} r={-6}>
            <Tag text="FREE" fill={C.green} />
          </Place>
        </Stage>
        <Abs x={0} y={160} w={1920} align="center" o={b.ramp(7, 0)}>
          <Body size={34} color={C.muted}>
            A fee on one method, another stays free
          </Body>
        </Abs>
        <Abs x={0} y={800} w={1920} align="center" o={b.rampAt(b.word(7, /vanish/, 0.7), 0.6)}>
          <div style={{fontFamily: FONT_TITLE, fontSize: 56, fontWeight: 700, color: C.cream}}>
            The cost doesn’t vanish. <span style={{color: C.orange}}>It gets routed.</span>
          </div>
        </Abs>
      </div>
    </SceneShell>
  );
};
