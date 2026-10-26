import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled locally (SIL OFL, see assets/fonts/*LICENSE.txt) so renders never depend on the network.
const FACES: [string, string, string][] = [
  ['Space Grotesk', 'fonts/SpaceGrotesk-Variable-latin.woff2', '300 700'],
  ['Inter', 'fonts/Inter-Variable-latin.woff2', '100 900'],
];

const loadOnce = (family: string, file: string, weight: string, timeoutMs: number) =>
  Promise.race([
    new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight}).load(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`timeout loading ${family}`)), timeoutMs)),
  ]);

const loadWithRetry = async (family: string, file: string, weight: string) => {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await loadOnce(family, file, weight, 8000 * attempt);
    } catch (e) {
      last = e;
    }
  }
  throw last;
};

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(FACES.map(([f, file, w]) => loadWithRetry(f, file, w)))
    .then((fs) => {
      fs.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
      continueRender(handle);
    })
    .catch((err) => {
      // Last resort: fall back to system fonts rather than failing the whole render.
      console.warn('Font loading failed, using fallbacks', err);
      continueRender(handle);
    });
};
