import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';

const MAX_BYTES = 2 * 1024 * 1024;
const PRIVATE_HOST =
  /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd])/i;

/**
 * GET /api/image-proxy?url= — re-serves a remote image from our own origin.
 * html-to-image (projector texture, PNG export) has to read the logo's pixels,
 * which the browser blocks for hosts that don't send Access-Control-Allow-Origin.
 */
export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  let target: URL;
  try {
    target = new URL(String(req.query.url ?? ''));
  } catch {
    res.status(400).json({ message: 'Invalid url' });
    return;
  }
  if (!/^https?:$/.test(target.protocol) || PRIVATE_HOST.test(target.hostname)) {
    res.status(400).json({ message: 'Only public http(s) URLs are allowed' });
    return;
  }

  try {
    const upstream = await fetch(target, { redirect: 'follow' });
    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !contentType.startsWith('image/')) {
      res.status(502).json({ message: `Upstream returned ${upstream.status} ${contentType}` });
      return;
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    if (body.length > MAX_BYTES) {
      res.status(413).json({ message: 'Image is larger than 2 MB' });
      return;
    }
    res
      .status(200)
      .header('Content-Type', contentType)
      .header('Cache-Control', 'public, max-age=86400')
      .header('Access-Control-Allow-Origin', '*')
      .end(body);
  } catch (error: any) {
    res.status(502).json({ message: error?.message ?? 'Fetch failed' });
  }
}
