// Structured request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      time: new Date().toISOString(),
    };
    const color = res.statusCode >= 500 ? '\x1b[31m'  // red
                : res.statusCode >= 400 ? '\x1b[33m'  // yellow
                : res.statusCode >= 300 ? '\x1b[36m'  // cyan
                : '\x1b[32m';                          // green
    console.log(`${color}[${log.time}] ${log.method} ${log.path} → ${log.status} (${log.duration})\x1b[0m`);
  });
  next();
};

module.exports = requestLogger;
