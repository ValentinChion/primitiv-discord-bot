import { register } from 'node:module';
register(new URL('./wasm-loader-hooks.mjs', import.meta.url));
