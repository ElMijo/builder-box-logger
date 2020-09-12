const spyLog = jest.fn()
jest.doMock('winston', () => ({
    __esModule: true,
    default: {
        addColors: jest.fn(),
        createLogger: jest.fn().mockImplementation(() => ({
            error: spyLog,
            warn: spyLog,
            info: spyLog,
            debug: spyLog
        })),
        format: {
            combine: jest.fn(),
            colorize: jest.fn(),
            simple: jest.fn(),
            timestamp: jest.fn(),
            metadata: jest.fn(),
            errors: jest.fn(),
            splat: jest.fn(),
            printf: jest.fn().mockImplementation((func: Function) => {
                const info = {
                    timestamp:'2050-12-01 12:00:00', 
                    level:'info', 
                    message:'Log message', 
                    metadata: {}
                }
                expect(func(info)).toBe('[2050-12-01 12:00:00] INFO Log message {}')
                expect(func({...info, ...{metadata:{anyKey:'any value'}}}))
                    .toBe('[2050-12-01 12:00:00] INFO Log message {"anyKey":"any value"}')
            })
        }
    }
}))
import winston from 'winston'
import { Logger } from '../../src/logger'
import { ConsoleTransportInstance } from 'winston/lib/winston/transports'
import { mock } from 'jest-mock-extended'

describe("Testing logger class...", () => {
    afterEach(() => spyLog.mockRestore())
    const logger = new Logger([mock<ConsoleTransportInstance>()])
    test("Checking that the Logger class is instantiable", () => {
        expect(logger).toBeInstanceOf(Object)
        expect(winston.addColors).toHaveBeenNthCalledWith(1, {
            error: "red",
            warn: "orange",
            info: "white bold blue",
            debug: "white bold pink"
        })
        expect(winston.format.errors).toHaveBeenNthCalledWith(1, { stack: true})
        expect(winston.format.timestamp).toHaveBeenNthCalledWith(1, { 
            format: 'YYYY-MM-DD HH:mm:ss' 
        })
        expect(winston.format.metadata).toHaveBeenNthCalledWith(1, { 
            fillExcept: ['message', 'level', 'timestamp', 'label']
         })
        expect(winston.format.combine).toHaveBeenCalledTimes(1)
        expect(winston.format.splat).toHaveBeenCalledTimes(1)
        expect(winston.format.simple).toHaveBeenCalledTimes(1)
    })
    test("Logging error method without metadata", () => {
        logger.error("Testing logger error")
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger error", {})
    })
    test("Logging error method with metadata", () => {
        logger.error("Testing logger error", {anyKey: 'any value'})
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger error", {anyKey: 'any value'})
    })
    test("Logging warn method without metadata", () => {
        logger.warn("Testing logger warn")
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger warn", {})
    })
    test("Logging warn method with metadata", () => {
        logger.warn("Testing logger warn", {anyKey: 'any value'})
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger warn", {anyKey: 'any value'})
    })
    test("Logging info method without metadata", () => {
        logger.info("Testing logger info")
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger info", {})
    })
    test("Logging info method with metadata", () => {
        logger.info("Testing logger info", {anyKey: 'any value'})
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger info", {anyKey: 'any value'})
    })
    test("Logging debug method without metadata", () => {
        logger.debug("Testing logger debug")
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger debug", {})
    })
    test("Logging debug method with metadata", () => {
        logger.debug("Testing logger debug", {anyKey: 'any value'})
        expect(spyLog).toHaveBeenNthCalledWith(1, "Testing logger debug", {anyKey: 'any value'})
    })
})
