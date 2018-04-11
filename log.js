const { createLogger, format, transports } = require('winston');
const util = require('util');

const getLogger = (callingModule) => {
  let fileArr = callingModule.filename.split('/');
  let file = callingModule.parent.parent !== null ? fileArr[fileArr.length -2] + '/' : '';
  file = file + fileArr.pop();

  let logger = createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.label({label: file}),
      //format.align(),
      format.printf((info) => {
        const {
          timestamp, level, message, label, ...args
        } = info;
        const ts = timestamp.slice(0, 19).replace('T', ' ');
        let logInfo = `${ts} [${level}]: [${label}]`;
        let nSpaces = logInfo.length > 64 ? 0 : 64 - logInfo.length;
        logInfo += Array(nSpaces+1).join(' ');
        
        return `${logInfo} ${util.format(message)} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    ),
    transports: [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' })
    ]
  });

  if (process.env.NODE_ENV !== 'production') {    
    logger.add(new transports.Console({
      level: 'debug'
    }));
  }
  return logger;
}

module.exports = getLogger;