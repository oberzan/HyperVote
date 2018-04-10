const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}


// const logger = new (winston.Logger)({
//   transports: [
//     new (winston.transports.Console)({ json: false, timestamp: true }),
//     new winston.transports.File({ filename: __dirname + '/debug.log', json: false })
//   ],
//   exceptionHandlers: [
//     new (winston.transports.Console)({ json: false, timestamp: true }),
//     new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
//   ],
//   exitOnError: false
// });

module.exports = logger;