import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {K} from '../../components/cine';
import {FONT_TITLE} from '../../themes/theme';

// Episode 004 thumbnails: Blender plates (blender/render_thumbs.py, copied to assets/thumbs/ep004_plate_X.png)
// + short, large text that survives a phone-sized preview. The "$20" is the episode's hook, not a claimed real fare.

const Mark: React.FC = () => (
  <div style={{position: 'absolute', left: 36, bottom: 28, display: 'flex', alignItems: 'center', gap: 10}}>
    <div style={{width: 12, height: 12, borderRadius: 6, background: K.orange}} />
    <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: K.ivory, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>HIDDEN LEDGER</span>
  </div>
);

export const Ep004Thumbnail: React.FC<{variant: number}> = ({variant}) => {
  if (variant === 1) {
    return (
      <AbsoluteFill style={{background: '#14110F'}}>
        <Img src={staticFile('thumbs/ep004_plate_A.png')} style={{width: 1280, height: 720}} />
        <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0) 35%, rgba(12,9,7,0.72) 75%)'}} />
        <div style={{position: 'absolute', right: 50, top: 120, width: 560, textAlign: 'right'}}>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 210, lineHeight: 0.9, color: K.orange, letterSpacing: -6, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>$20</div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 92, lineHeight: 0.95, color: K.ivory, letterSpacing: -2, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>FLIGHT?</div>
          <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: K.ivory, marginTop: 22, opacity: 0.92}}>Who's really paying</div>
        </div>
        <Mark />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: '#14110F'}}>
      <Img src={staticFile('thumbs/ep004_plate_B.png')} style={{width: 1280, height: 720}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(12,9,7,0.55) 0%, rgba(0,0,0,0) 45%)'}} />
      <div style={{position: 'absolute', left: 56, top: 40}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 118, lineHeight: 0.95, color: K.ivory, letterSpacing: -3, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>
          HOW IS THIS <span style={{color: K.orange}}>$20?</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 820, top: 300, transform: 'rotate(-8deg)', background: K.ivory, color: K.ink, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96, padding: '10px 34px', borderRadius: 16, boxShadow: '0 18px 40px rgba(0,0,0,0.45)'}}>
        $20
      </div>
      <Mark />
    </AbsoluteFill>
  );
};
