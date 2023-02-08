import winston from "winston";

const myFormat = winston.format.printf(
  ({ _level, message, _label, timestamp }) => {
    return `${timestamp}: ${message}`;
  }
);

export const logger = winston.createLogger({
  level: "verbose",
  format: winston.format.combine(winston.format.timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: "debug.log",
      maxsize: 10000000,
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);
