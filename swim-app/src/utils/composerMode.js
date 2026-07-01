export function isSceneComposerAllowed(locationObject) {
  const loc = locationObject || (typeof window !== 'undefined' ? window.location : null);
  if (!loc) return false;

  const hostname = (loc.hostname || '').toLowerCase();
  if (!hostname) return true;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
    return true;
  }
  if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) {
    return true;
  }

  const private172 = hostname.match(/^172\.(\d+)\./);
  return !!private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31;
}

export function isSceneComposerMode(locationObject) {
  const loc = locationObject || (typeof window !== 'undefined' ? window.location : null);
  if (!loc) return false;

  const params = new URLSearchParams(loc.search || '');
  return params.has('composer') && isSceneComposerAllowed(loc);
}
