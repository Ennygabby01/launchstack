export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] ${status} - ${message}`);

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}
