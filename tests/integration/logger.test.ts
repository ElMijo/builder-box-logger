import { resolve } from 'path'
import { readFile, truncate } from 'fs'
import winston from 'winston'
import { Logger } from '../../src/logger'


const filename = resolve(__dirname, './test.log')

const getLog = (debug = false) => new Promise((res, rej) => {
    readFile(filename, {encoding:'utf8'}, (err, data) => {
        if(err) return rej(err)
        if (debug) console.log(data)
        truncate(filename, (err) => {
            if(err) return rej(err)
            res(data)
        })
    })
})

const logPattern = (patterns: RegExp[])  => new RegExp(patterns.map(item => item.source).join(' '))

describe("Testing logger class...", () => {
    const logger = new Logger([
        new winston.transports.File({filename, handleExceptions: true})
    ])
    const regexpDate = /\[\d{4}\-\d{2}\-\d{2} \d{2}\:\d{2}\:\d{2}\]/
    const regexpText = /Testing logger/
    const regexpMeta = /{"anyKey":"any value"}/
    const regexpEmptyMeta = /{}/

    test("Logging debug method without metadata", () => {
        logger.debug("Testing logger")
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /DEBUG/,  regexpText, regexpEmptyMeta]))
    })
    test("Logging debug method with metadata", () => {
        logger.debug("Testing logger", {anyKey: 'any value'})
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /DEBUG/,  regexpText, regexpMeta]))
    })

    test("Logging warn method without metadata", () => {
        logger.warn("Testing logger")
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /WARN/,  regexpText, regexpEmptyMeta]))
    })
    test("Logging warn method with metadata", () => {
        logger.warn("Testing logger", {anyKey: 'any value'})
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /WARN/,  regexpText, regexpMeta]))
    })

    test("Logging info method without metadata", () => {
        logger.info("Testing logger")
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /INFO/,  regexpText, regexpEmptyMeta]))
    })
    test("Logging info method with metadata", () => {
        logger.info("Testing logger", {anyKey: 'any value'})
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /INFO/,  regexpText, regexpMeta]))
    })

    test("Logging error method without metadata", () => {
        logger.error("Testing logger")
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /ERROR/,  regexpText, regexpEmptyMeta]))
    })
    test("Logging error method with metadata", () => {
        logger.error("Testing logger", {anyKey: 'any value'})
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /ERROR/,  regexpText, regexpMeta]))
    })
    test("Logging exception without message", () => {
        logger.error(new Error("Testing logger"))
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /ERROR/,  /Error: Testing logger/]))
    })

    test("Logging exception with message", () => {
        logger.error("Trigger Exception", new Error("Testing logger"))
        expect(getLog()).resolves.toMatch(logPattern([regexpDate, /ERROR/,  /Trigger Exception/]))
    })
})
