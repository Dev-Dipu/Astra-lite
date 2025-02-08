import morgan from 'morgan';
import chalk from 'chalk';

const loggerMiddleware = morgan((tokens, req, res) => {
  return [
    chalk.green.bold(tokens.method(req, res)),
    tokens.url(req, res),
    chalk.blue.bold(tokens.status(req, res)),
    chalk.white(tokens.res(req, res, 'content-length')),
    '-',
    chalk.yellow(tokens['response-time'](req, res)),
    chalk.yellow('ms'),
    req.ip,
  ].join(' ');
});

export default loggerMiddleware;