/**
 * Provide basic logging functionality from the TSlog library.
 */
import {Logger} from 'tslog';

/* Specify which level and above should be logged.
 * Levels:  0:silly, 1:debug, 2: info ...
 */
const log: Logger = new Logger({minLevel: 'debug'});

export {log};
