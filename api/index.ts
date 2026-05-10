import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/app';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const protocol = (req.headers['x-forwarded-proto'] as string) ?? 'http';
  const host = req.headers.host ?? 'localhost';
  const url = `${protocol}://${host}${req.url ?? '/'}`;

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) headers.set(name, value.join(', '));
    else headers.set(name, String(value));
  }

  let body: BodyInit | undefined;
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise<string>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      req.on('data', (chunk: Uint8Array | string) => {
        chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  const response = await app.fetch(request);

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}
