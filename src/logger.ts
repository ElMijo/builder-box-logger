import winston from 'winston'
import { exception } from './format'

/**
 * Interface to implement Logger levels
 */
interface LoggerLevelsInterface {
    [index: string]: number
}

/**
 * Interface to implement Logger Colors
 */
interface LoggerColorInterface {
    [index: string]: string
}
/**
 * Interface to defined log method structure
 */
interface LoggerMethod {
    (message: string | Error, meta: Object): LoggerInterface
}

interface LoggerExceptionMethod {
    (exception: Error): LoggerInterface
    (message: string, exception: Error): LoggerInterface
}

/**
 * Define available logger levels.
 */
const LoggerLevels: LoggerLevelsInterface = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 4,
}
/**
 * Define logger colors by levels
 */
const LoggerColor: LoggerColorInterface = {
    error: 'red',
    warn: 'orange',
    info: 'white bold blue',
    debug: 'white bold pink',
}
/**
 * Interface to implement a Builder Box Logger
 */
export interface LoggerInterface {
    /**
     * This method render the error logs on the different transports.
     *
     * @param {string} message
     * @param {Object} meta
     * @returns {LoggerInterface}
     */
    error: LoggerMethod

    /**
     * This method render the warning logs on the different transports.
     *
     * @param {string} message
     * @param {Object} meta
     * @returns {LoggerInterface}
     */
    warn: LoggerMethod

    /**
     * This method render the info logs on the different transports.
     *
     * @param {string} message
     * @param {Object} meta
     * @returns {LoggerInterface}
     */
    info: LoggerMethod

    /**
     * This method render the debugging logs on the different transports.
     *
     * @param {string} message
     * @param {Object} meta
     * @returns {LoggerInterface}
     */
    debug: LoggerMethod
}

winston.addColors(LoggerColor)

export class Logger implements LoggerInterface {
    /**
     * @var {winston.Logger}
     */
    private logger: winston.Logger

    /**
     * Logger constructor.
     *
     * @param {[winston.transport]} transports
     */
    public constructor(transports: [winston.transport]) {
        this.logger = winston.createLogger({
            transports,
            level: 'debug',
            levels: LoggerLevels,
            exitOnError: false,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.metadata({
                    fillExcept: ['message', 'level', 'timestamp', 'label'],
                }),
                exception(),
                winston.format.printf((info) => {
                    const { timestamp, level, message, metadata } = info
                    return `[${timestamp}] ${level.toUpperCase()} ${message} ${JSON.stringify(
                        metadata
                    )}`
                })
            ),
        })
    }

    /**
     * {@inheritdoc}
     */
    public error(message: string | Error, meta: Object = {}): LoggerInterface {
        return this.log('error', message, meta)
    }

    /**
     * {@inheritdoc}
     */
    public warn(message: string | Error, meta: Object = {}): LoggerInterface {
        return this.log('warn', message, meta)
    }

    /**
     * {@inheritdoc}
     */
    public info(message: string | Error, meta: Object = {}): LoggerInterface {
        return this.log('info', message, meta)
    }

    /**
     * {@inheritdoc}
     */
    public debug(message: string | Error, meta: Object = {}): LoggerInterface {
        return this.log('debug', message, meta)
    }

    /**
     * This method render logs by levels on the different transports.
     *
     * @param {string} level
     * @param {string} message
     * @param {Object} meta
     * @returns {LoggerInterface}
     */
    private log(
        level: string,
        message: string | Error,
        meta: Object
    ): LoggerInterface {
        this.logger[level](message, meta)
        return this
    }
}
