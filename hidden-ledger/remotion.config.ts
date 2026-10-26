import {Config} from '@remotion/cli/config';

// Conservative defaults for modest CPUs; override with --concurrency / --scale on the CLI.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(2);
Config.setPublicDir('assets');
Config.setEntryPoint('src/main.ts');
