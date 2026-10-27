import React from 'react';
import {Bill, CheckoutSet, Product} from '../../components/grocery';
import {Place} from '../../components/icons';
import {Frame, svg} from '../../compositions/Thumbnail';
import {C, FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Episode 002 thumbnails (1280x720). Only figures that appear, sourced, in the video:
// Kroger's $1.28 of operating profit per $100 of sales (fiscal 2025) and its $147.6B of sales.

export const Ep002Thumbnail: React.FC<{variant: number}> = ({variant}) => {
  if (variant === 1) {
    // $100 bill -> $1.28
    return (
      <Frame>
        {svg(
          <>
            <Place x={330} y={300} s={1.35} r={-8}>
              <Bill />
            </Place>
            <path d="M560 330 L700 330" stroke={C.cream} strokeWidth={14} strokeLinecap="round" />
            <path d="M690 296 L740 330 L690 364 Z" fill={C.cream} />
            <Place x={330} y={560} s={0.55}>
              <Product kind="milk" />
            </Place>
            <Place x={460} y={560} s={0.55}>
              <Product kind="bread" />
            </Place>
            <Place x={190} y={560} s={0.55}>
              <Product kind="eggs" />
            </Place>
          </>,
        )}
        <div style={{position: 'absolute', left: 760, top: 160, width: 500, textAlign: 'left'}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 190, color: C.green, letterSpacing: -6, lineHeight: 1}}>$1.28</div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, color: C.cream, lineHeight: 1.05, marginTop: 14}}>
            kept from
            <br />
            every $100?
          </div>
        </div>
        <div style={{position: 'absolute', right: 36, bottom: 30, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, color: C.muted}}>Kroger operating profit, FY2025</div>
      </Frame>
    );
  }
  // variant 2: huge sales column, sliver of profit
  return (
    <Frame>
      {svg(
        <>
          <g transform="translate(0 -30)">
            <CheckoutSet t={2.2} items={[{kind: 'cereal', at: 1.6}, {kind: 'coffee', at: 2.3}, {kind: 'milk', at: 3.0}]} total="$100.00" receipt={0.4} y={600} />
          </g>
          <rect x={0} y={0} width={1280} height={720} fill="rgba(17,20,24,0.55)" />
          <g transform="translate(960 640)">
            <rect x={-110} y={-560} width={220} height={560} rx={8} fill={C.orange} />
            <rect x={-110} y={-574} width={220} height={12} rx={4} fill={C.green} />
            <circle cx={0} cy={-568} r={36} fill="none" stroke={C.cream} strokeWidth={6} />
          </g>
        </>,
      )}
      <div style={{position: 'absolute', left: 60, top: 120, width: 700}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 118, color: C.cream, lineHeight: 0.95, letterSpacing: -3}}>
          HUGE SALES.
          <br />
          <span style={{color: C.green}}>TINY</span> PROFIT.
        </div>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44, color: C.orange, marginTop: 24}}>How supermarkets make money</div>
      </div>
    </Frame>
  );
};
