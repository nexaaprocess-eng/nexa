import {Config} from '@remotion/cli/config';

// Chromium ya instalado en el contenedor (evita que Remotion descargue el suyo).
// En otro ordenador basta con borrar esta línea.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setAudioCodec('aac');
Config.setAudioBitrate('256k');
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('swangle');
