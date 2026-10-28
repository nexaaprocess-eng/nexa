import React from 'react';
import {APPS, Notice, Phone} from '../../components/apps';
import {Frame} from '../../compositions/Thumbnail';
import {C, FONT_TITLE} from '../../themes/theme';

// Episode 003 thumbnails (1280x720). No figures (nothing to misread out of context); fictional apps only.

export const Ep003Thumbnail: React.FC<{variant: number}> = ({variant}) => {
  if (variant === 1) {
    // a phone drowning in renewal notifications
    return (
      <Frame>
        <Phone x={330} y={400} w={290} tilt={12} light={false}>
          <div style={{fontFamily: FONT_TITLE, fontSize: 70, fontWeight: 700, textAlign: 'center', marginTop: 40, color: C.cream}}>9:41</div>
        </Phone>
        <div style={{position: 'absolute', left: 150, top: 150, display: 'flex', flexDirection: 'column', gap: 10, transform: 'rotate(-4deg)'}}>
          {(['music', 'stream', 'fit', 'ai'] as const).map((k, i) => (
            <div key={k} style={{transform: `translateX(${i * 26}px)`}}>
              <Notice app={APPS[k]} title={`${APPS[k].name} renewed`} body="monthly plan" w={440} />
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 680, top: 160, width: 570}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 112, lineHeight: 0.95, color: C.cream, letterSpacing: -3}}>
            RENEWED.
            <br />
            <span style={{color: C.orange}}>AGAIN.</span>
          </div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44, color: C.cream, marginTop: 26}}>Why every app wants a subscription</div>
        </div>
      </Frame>
    );
  }
  // own it vs rent it
  return (
    <Frame>
      <div style={{position: 'absolute', left: 110, top: 150, width: 260, height: 330, background: '#3A8FD9', border: `6px solid ${C.cream}`, borderRadius: 10, transform: 'rotate(-6deg)', padding: 22, boxSizing: 'border-box', fontFamily: FONT_TITLE, fontWeight: 700, color: '#fff'}}>
        <div style={{fontSize: 34}}>PHOTO STUDIO</div>
        <div style={{width: 130, height: 130, borderRadius: '50%', margin: '30px auto 0', background: 'radial-gradient(circle, #fff 0 12%, #cfd6df 13% 40%, #9aa5b3 41% 100%)', border: '4px solid #1B1F25'}} />
      </div>
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <g transform="translate(590 340)">
          <circle r={150} fill="none" stroke={C.orange} strokeWidth={26} strokeDasharray="70 24" />
          <text y={22} textAnchor="middle" fontSize={64} fontWeight={700} fill={C.cream} fontFamily="Space Grotesk">
            /mo
          </text>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 780, top: 160, width: 480}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96, lineHeight: 0.98, color: C.cream, letterSpacing: -2}}>
          OWN IT,
          <br />
          OR <span style={{color: C.orange}}>RENT IT?</span>
        </div>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.cream, marginTop: 24}}>The subscription economy, explained</div>
      </div>
    </Frame>
  );
};
