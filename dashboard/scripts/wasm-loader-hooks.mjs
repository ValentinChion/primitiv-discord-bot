import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function load(url, context, nextLoad) {
  if (url.endsWith('.wasm')) {
    const filePath = fileURLToPath(url);
    const bytes = readFileSync(filePath);
    const base64 = bytes.toString('base64');
    return {
      format: 'module',
      source: `const b=Buffer.from("${base64}","base64");export default new WebAssembly.Module(b);`,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
