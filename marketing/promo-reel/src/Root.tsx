import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import {Promo} from './Promo';
import TL from './timeline.json';

const FPS = 60;

// Espera a que las fuentes estén cargadas antes de capturar fotogramas.
const Fonts: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fuentes'));
  useEffect(() => {
    const ws = ['500', '600', '700', '800'].map((w) => `${w} 40px Montserrat`).concat(['400', '500', '600'].map((w) => `${w} 40px Inter`));
    Promise.all(ws.map((f) => document.fonts.load(f, 'ÁÉÍÓÚÑáéíóúñ¿?€0123456789'))).then(() => continueRender(h));
  }, [h]);
  return <>{children}</>;
};

const Main: React.FC<{withAudio?: boolean}> = (props) => <Fonts><Promo {...props} /></Fonts>;

export const Root: React.FC = () => (
  <>
    <Composition id="NexaPromo" component={Main} durationInFrames={Math.round(TL.total * FPS)} fps={FPS} width={1080} height={1920}
      defaultProps={{withAudio: true}} />
    <Composition id="NexaPromo30" component={Main} durationInFrames={Math.round(TL.total * 30)} fps={30} width={1080} height={1920}
      defaultProps={{withAudio: true}} />
  </>
);
