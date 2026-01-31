import winston from 'winston';
import { blue, green, yellow, red, gray, magenta, cyan } from 'colorette';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

const levelColors = {
  INFO: green,
  WARN: yellow,
  ERROR: red,
  DEBUG: blue,
  TRACE: gray
};

const springBootFormat = printf(({ level, message, timestamp, stack }) => {
  const pid = process.pid;
  const upperLevel = level.toUpperCase().padEnd(5);
  const colorizer = levelColors[upperLevel.trim()] || ((s) => s);

  // Format: 2024-03-20 12:00:00.000  INFO 12345 --- [           main] : Message
  const ts = gray(timestamp.replace('T', ' ').replace('Z', ''));
  const lvl = colorizer(upperLevel);
  const p = magenta(pid.toString().padEnd(5));
  const separator = gray('--- [           main]');

  return `${ts} ${lvl} ${p} ${separator} : ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    errors({ stack: true }),
    springBootFormat
  ),
  transports: [
    new transports.Console()
  ],
});

export default logger;
