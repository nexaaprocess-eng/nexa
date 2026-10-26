import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Box, House, Invoice, Place, Tag, Truck, Warehouse} from '../components/icons';
import {LedgerMark} from '../components/ui';
import {C, FONT_TITLE} from '../themes/theme';
import {loadFonts} from '../themes/fonts';

loadFonts();

export type ThumbProps = {variant: number};

// 1280x720 thumbnails. Text is short and large so it survives a phone-sized preview. No figures or promises.
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 35% 50%, #1F252D 0%, #111418 70%)'}} />
    {children}
    <div style={{position: 'absolute', left: 36, bottom: 30, display: 'flex', alignItems: 'center', gap: 12}}>
      <LedgerMark size={34} />
      <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.cream}}>HIDDEN LEDGER</span>
    </div>
  </AbsoluteFill>
);

const svg = (children: React.ReactNode) => (
  <svg viewBox="0 0 1280 720" width={1280} height={720} style={{position: 'absolute', inset: 0}}>
    {children}
  </svg>
);

export const Thumbnail: React.FC<ThumbProps> = ({variant}) => {
  if (variant === 1) {
    // Big box, label "FREE?"
    return (
      <Frame>
        {svg(
          <>
            <Place x={400} y={350} s={2.7} r={-6}>
              <Box />
            </Place>
            <g transform="translate(400 385) rotate(-6) scale(0.85)">
              <rect x={-190} y={-80} width={380} height={170} rx={14} fill={C.cream} stroke={C.bg} strokeWidth={8} />
              <rect x={-190} y={-80} width={380} height={40} rx={10} fill={C.orange} />
              <text x={0} y={70} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={110} fill={C.bg}>
                FREE?
              </text>
            </g>
          </>,
        )}
        <div style={{position: 'absolute', left: 760, top: 190, width: 480, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 104, lineHeight: 0.98, color: C.cream, letterSpacing: -2}}>
          Who pays
          <br />
          <span style={{color: C.orange}}>for it?</span>
        </div>
      </Frame>
    );
  }
  if (variant === 2) {
    // Return route + "WHO PAYS?"
    return (
      <Frame>
        {svg(
          <>
            <path d="M190 470 C 360 330, 520 600, 680 470 S 980 360, 1100 470" fill="none" stroke={C.orange} strokeWidth={14} strokeDasharray="30 22" />
            <Place x={170} y={470} s={1.15}>
              <House />
            </Place>
            <Place x={640} y={470} s={1.15}>
              <Truck />
            </Place>
            <Place x={1110} y={470} s={1.15}>
              <Warehouse />
            </Place>
            <Place x={420} y={445} s={0.6} r={-10}>
              <Box label="RETURN" />
            </Place>
            {[300, 860].map((x) => (
              <g key={x} transform={`translate(${x} ${x === 300 ? 560 : 380})`}>
                <circle r={40} fill={C.red} />
                <text y={18} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={52} fill={C.cream}>
                  $?
                </text>
              </g>
            ))}
          </>,
        )}
        <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 150, color: C.cream, letterSpacing: -3}}>
          WHO <span style={{color: C.orange}}>PAYS?</span>
        </div>
      </Frame>
    );
  }
  // variant 3: free tag vs the hidden bill
  return (
    <Frame>
      {svg(
        <>
          <Place x={360} y={230} s={1.8} r={-12}>
            <Tag text="FREE" />
          </Place>
          <Place x={920} y={250} s={1.55} r={6}>
            <Invoice accent={C.red} lines={5} />
          </Place>
          <text x={1060} y={150} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={120} fill={C.red} transform="rotate(6 920 250)">
            ?
          </text>
        </>,
      )}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 80, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 86, lineHeight: 1.0, color: C.cream, letterSpacing: -2}}>
        The <span style={{color: C.red}}>hidden bill</span>
        <br />
        of free returns
      </div>
    </Frame>
  );
};
