export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({ message: `Duplicate value for ${Object.keys(err.keyPattern || {}).join(', ')}` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join('; ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  console.error('[error]', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
