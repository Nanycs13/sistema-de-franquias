// quick loader to require ESM route file via dynamic import
(async () => {
  try {
    const mod = await import('../src/app/api/franquias/[id]/route.js');
    console.log('Route module keys:', Object.keys(mod));
  } catch (e) {
    console.error('Failed to import route module:', e);
    process.exit(1);
  }
})();
