import { format } from 'winston'
import { TransformableInfo } from 'logform'
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam'

/**
 * Interface to implement an FormatExceptionOptions object
 */
export interface FormatExceptionOptions {
    metaKey?: string
}

/**
 * Interface to implement an FormatException object
 */
export interface FormatException {
    message: string
    trace: string[]
}

export interface ParserExceptionInterface {
    /**
     * Try to generate a FormatException from  TransformableInfo
     * @param {TransformableInfo | any} obj
     * @returns {[FormatException, Error] | null}
     */
    getFormatException(
        obj: TransformableInfo | any
    ): [FormatException, Error] | null

    /**
     * Extract Error object from TransformableInfo message
     * @param {TransformableInfo | any} obj
     * @returns {Error | null}
     */
    extractMessageError(obj: TransformableInfo | any): Error | null

    /**
     * Extract first Error object from TransformableInfo splat
     * @param {TransformableInfo} obj
     * @returns {Error | null}
     */
    extractSplatError(obj: TransformableInfo): Error | null

    /**
     * Parse Error object.
     * @param {Error} error
     * @returns {FormatException}
     */
    parseError(error: Error): FormatException

    /**
     * Parse stack string.
     * @param {string} stack
     * @returns {FormatException}
     */
    parseStack(stack: string): FormatException
}

export class ParserError implements ParserExceptionInterface {
    /**
     * {@inheritdoc}
     */
    public getFormatException(
        obj: TransformableInfo | any
    ): [FormatException, Error] | null {
        const err = this.extractMessageError(obj) || this.extractSplatError(obj)
        return err ? [this.parseError(err), err] : null
    }

    /**
     * {@inheritdoc}
     */
    public extractMessageError(obj: TransformableInfo | any): Error | null {
        return this.isErr(obj)
            ? obj
            : obj.message && this.isErr(obj.message)
            ? obj.message
            : null
    }

    /**
     * {@inheritdoc}
     */
    public extractSplatError(obj: TransformableInfo | any): Error | null {
        return (obj[SPLAT] || []).filter(this.isErr).shift()
    }

    /**
     * {@inheritdoc}
     */
    public parseError(error: Error): FormatException {
        return this.parseStack(error.stack)
    }

    /**
     * {@inheritdoc}
     */
    public parseStack(stack: string): FormatException {
        return stack.split('\n').reduce(
            (acc, cur, inx) => {
                switch (inx) {
                    case 0:
                        acc.message = cur
                        break
                    default:
                        acc['trace'].push(cur.trim().replace(/^at /gim, ''))
                }
                return acc
            },
            { message: '', trace: [] }
        )
    }

    /**
     * Validate if the object is an Error
     * @param obj
     * @returns {boolean}
     */
    private isErr(obj: any): boolean {
        return obj instanceof Error
    }
}

/**
 * Transform logger info when detected an exception.
 *
 * @param {TransformableInfo} info
 * @param {FormatExceptionOptions} opts
 *
 * @returns {Format}
 */
export const exception = format(
    (info, opts: FormatExceptionOptions = {}): TransformableInfo => {
        const { metaKey = 'metadata' } = opts
        const parser = new ParserError()
        const [exception, error] = parser.getFormatException(info) || []
        const metadata = info[metaKey] || {}
        const getMessage = (data: any, exc: FormatException) => {
            let msg = exc.message

            if (typeof data === 'string') {
                msg = data
                    .replace(new RegExp(msg.substr(msg.indexOf(':') + 1)), '')
                    .trim()
            }

            return msg
        }

        if (!error) return info

        delete info.stack
        delete metadata.stack

        return Object.assign({}, info, {
            level: info.level || 'error',
            message: getMessage(info.message, exception),
            [LEVEL]: error[LEVEL] || info.level,
            [MESSAGE]: error[MESSAGE] || exception.message,
            [metaKey]: { ...metadata, exception },
        })
    }
)
