const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.simple(),
  transports: [
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      //format.align(),
      format.printf((info) => {
        const {
          timestamp, level, message, ...args
        } = info;
        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    )
      
  }));
}

module.exports = logger;