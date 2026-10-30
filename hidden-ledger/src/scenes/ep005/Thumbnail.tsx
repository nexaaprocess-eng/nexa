import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {K} from '../../components/cine';
import {FONT_BODY, FONT_TITLE} from '../../themes/theme';

// Episode 005 thumbnails: Blender plates (blender/render_thumbs5.py -> assets/thumbs/ep005_plate_X.png) + short, large
// text that survives a phone-sized preview. The hotel and booking are fictional.

const Mark: React.FC = () => (
  <div style={{position: 'absolute', left: 36, bottom: 28, display: 'flex', alignItems: 'center', gap: 10}}>
    <div style={{width: 12, height: 12, borderRadius: 6, background: K.orange}} />
    <span style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: K.ivory, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>HIDDEN LEDGER</span>
  </div>
);

export const Ep005Thumbnail: React.FC<{variant: number}> = ({variant}) => {
  if (variant === 1) {
    return (
      <AbsoluteFill style={{background: '#14110F'}}>
        <Img src={staticFile('thumbs/ep005_plate_A.png')} style={{width: 1280, height: 720}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(12,9,7,0.78) 0%, rgba(12,9,7,0.2) 30%, rgba(0,0,0,0) 45%, rgba(12,9,7,0.5) 100%)'}} />
        <div style={{position: 'absolute', left: 44, top: 26, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 158, lineHeight: 1, color: K.ivory, letterSpacing: -4, textShadow: '0 8px 40px rgba(0,0,0,0.7)'}}>
          NO ROOMS<span style={{color: K.orange}}>?!</span>
        </div>
        <div style={{position: 'absolute', left: 48, bottom: 84, background: K.ivory, color: K.ink, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, padding: '8px 22px', borderRadius: 12}}>
          I booked this room.
        </div>
        <Mark />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: '#14110F'}}>
      <Img src={staticFile('thumbs/ep005_plate_B.png')} style={{width: 1280, height: 720}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(12,9,7,0) 55%, rgba(12,9,7,0.55) 100%)'}} />
      <div style={{position: 'absolute', left: 720, top: 545, transform: 'rotate(-6deg)', background: '#2F8F5B', color: '#FFFFFF', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, padding: '10px 26px', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.45)'}}>
        CONFIRMED ✓
      </div>
      <div style={{position: 'absolute', left: 48, top: 520, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 92, lineHeight: 0.95, color: K.ivory, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>
        …but <span style={{color: K.orange}}>FULL</span>
      </div>
      <Mark />
    </AbsoluteFill>
  );
};
