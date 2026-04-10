const DEFAULT_LIMIT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 30;
const updateBuckets = new Map();

const getClientKey = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return String(forwardedFor).split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || 'unknown';
};

const requireApiKey = (req, res, next) => {
  const requiredApiKey = process.env.SMARTBIN_API_KEY;
  if (!requiredApiKey) {
    return next();
  }

  const providedKey = req.header('x-api-key');
  if (providedKey !== requiredApiKey) {
    return res.status(401).json({ error: 'Missing or invalid API key.' });
  }

  return next();
};

const rateLimitUpdates = (req, res, next) => {
  const windowMs = Number(process.env.UPDATE_RATE_LIMIT_WINDOW_MS || DEFAULT_LIMIT_WINDOW_MS);
  const maxRequests = Number(process.env.UPDATE_RATE_LIMIT_MAX || DEFAULT_MAX_REQUESTS);
  const key = getClientKey(req);
  const now = Date.now();

  const bucket = updateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  updateBuckets.set(key, bucket);

  if (bucket.count > maxRequests) {
    return res.status(429).json({ error: 'Too many update requests. Please slow down.' });
  }

  return next();
};

module.exports = {
  requireApiKey,
  rateLimitUpdates,
};
