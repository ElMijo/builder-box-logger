import { exception, ParserError } from '../../src/format'
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam'

const mockError = () => {
    const error = new Error('Testing exception')
    error.stack = 'Error: Testing exception\n  at trace1\n  at trace2\n  at trace3'
    return error
}

describe('Testing ParserError class...', () => {
    const parser = new ParserError
    const initInfo = { level: 'error', message: 'any message' }

    test('Test parseStack method with empty string', () => {
        expect(parser.parseStack('')).toStrictEqual({message:'', trace:[]})
    })

    test('Test parseStack method with string without stack format', () => {
        expect(parser.parseStack('Any message')).toStrictEqual({message:'Any message', trace:[]})
    })

    test('Test parseStack method with string with stack format', () => {
        expect(parser.parseStack('Any message\ntrace 1\ntrace 2'))
            .toStrictEqual({message:'Any message', trace:['trace 1', 'trace 2']})
    })

    test('Testing parseError method with Error object', () => {
        const err = new Error('Any message')
        err.stack = 'Any message\nat Object.<anonymous> trace 1\nat Object.<anonymous> trace 2'
        expect(parser.parseError(err))
            .toStrictEqual({message:'Any message', trace:[
                'Object.<anonymous> trace 1',
                'Object.<anonymous> trace 2'
            ]})
    })


    test('Testing extractSplatError method when SPLAT index not exists in info object' , () => {
        expect(parser.extractSplatError(initInfo)).toBeUndefined()
    })
    test('Testing extractSplatError method when SPLAT index exists and it\'s not Array type', () => {
        const info = Object.assign({}, initInfo, { [SPLAT] : null})
        expect(parser.extractSplatError(info)).toBeUndefined()
    })
    test('Testing extractSplatError method when SPLAT index exists and it\'s an empty Array', () => {
        const info = Object.assign({}, initInfo, { [SPLAT] : []})
        expect(parser.extractSplatError(info)).toBeUndefined()
    })
    test('Testing extractSplatError method when SPLAT index exists and it\'s not Error Array', () => {
        const info = Object.assign({}, initInfo, { [SPLAT] : [1, 'any', {}]})
        expect(parser.extractSplatError(info)).toBeUndefined()
    })
    test('Testing extractSplatError method when SPLAT index exists and it\'s an Error Array', () => {
        const err = new Error('Any message')
        const info = Object.assign({}, initInfo, { [SPLAT] : [1, '', {}, err, new Error('Any message 2')]})
        expect(parser.extractSplatError(info)).toStrictEqual(err)
    })

    test('Testing extractMessageError method when Format info object there\'s not have Error', () => {
        expect(parser.extractMessageError(initInfo)).toBeNull()
    })
    test('Testing extractMessageError method when Format info object is an Error', () => {
        const err = new Error('Any message')
        expect(parser.extractMessageError(Object.assign(err, initInfo))).toStrictEqual(err)
    })
    test('Testing extractMessageError method when Format info message is an Error', () => {
        const err = new Error('Any message')
        const info = Object.assign({}, initInfo, { message: err})
        expect(parser.extractMessageError(info)).toStrictEqual(err)
    })

    test('Testing getFormatException when Format info object there\'s not have Error', () => {
        expect(parser.getFormatException(initInfo)).toBeNull()
    })
    test('Testing getFormatException when Format info object there is an Error', () => {
        const err = new Error('Any message')
        err.stack = 'Any message\nat Object.<anonymous> trace 1\nat Object.<anonymous> trace 2'
        expect(parser.getFormatException(Object.assign(err, initInfo)))
            .toStrictEqual([
                {
                    message:'Any message',
                    trace:['Object.<anonymous> trace 1', 'Object.<anonymous> trace 2']
                },
                err
            ])
    })
    test('Testing getFormatException when Format info object message is an Error', () => {
        const err = new Error('Any message')
        err.stack = 'Any message\nat Object.<anonymous> trace 1\nat Object.<anonymous> trace 2'
        const info = Object.assign({}, initInfo, { message: err})
        expect(parser.getFormatException(info))
        .toStrictEqual([
            {
                message:'Any message',
                trace:['Object.<anonymous> trace 1', 'Object.<anonymous> trace 2']
            },
            err
        ])
    })
    test('Testing getFormatException when Format info object there is an Error in  SPLAT index', () => {
        const err = new Error('Any message')
        err.stack = 'Any message\nat Object.<anonymous> trace 1\nat Object.<anonymous> trace 2'
        expect(parser.getFormatException(Object.assign({}, initInfo, { [SPLAT] : [err]})))
        .toStrictEqual([
            {
                message:'Any message',
                trace:['Object.<anonymous> trace 1', 'Object.<anonymous> trace 2']
            },
            err
        ])
    })
})

describe('Testing Exception Format...', () => {
    const info = { level: 'info', message: 'any message' }
    test('Check result when info is not an exception', () => {
        expect(exception().transform(info)).toBe(info)
        expect(exception({ metaKey: 'meta'}).transform(info)).toBe(info)
    })

    test('Check result when info is an exception', () => {
        // @ts-ignore
        expect(exception().transform(mockError())).toStrictEqual({
            level: 'error',
            message: 'Testing exception',
            metadata: {
                exception: {
                    message: 'Error: Testing exception',
                    trace: ['trace1', 'trace2', 'trace3']
                }
            },
            [LEVEL]: undefined,
            [MESSAGE]: 'Error: Testing exception',
        })

        const formatOptions = exception({ metaKey: 'meta'})
        // @ts-ignore
        expect(formatOptions.transform(mockError(), formatOptions.options)).toStrictEqual({
            level: 'error',
            message: 'Testing exception',
            meta: {
                exception: {
                    message: 'Error: Testing exception',
                    trace: ['trace1', 'trace2', 'trace3']
                }
            },
            [LEVEL]: undefined,
            [MESSAGE]: 'Error: Testing exception',
        })
    })

    test('Check result when info.message is an exception', () => {
        // @ts-ignore
        expect(exception().transform({ level: 'info', message: mockError() })).toStrictEqual({
            level: 'info',
            message: 'Error: Testing exception',
            metadata: {
                exception: {
                    message: "Error: Testing exception",
                    trace: ['trace1', 'trace2', 'trace3']
                }
            },
            [LEVEL]: 'info',
            [MESSAGE]: "Error: Testing exception",
        })
        const format = exception({ metaKey: 'meta'})
        // @ts-ignore
        expect(format.transform({ level: 'info', message: mockError()}, format.options)).toStrictEqual({
            level: 'info',
            message: "Error: Testing exception",
            meta: {
                exception: {
                    message: "Error: Testing exception",
                    trace: ['trace1', 'trace2', 'trace3']
                }
            },
            [LEVEL]: 'info',
            [MESSAGE]: "Error: Testing exception",
        })
    })

    test('Check result when there is an exception in SPLAT', () => {
        const err = mockError()
        expect(exception().transform({ level: 'info', message: 'Trigger error', [SPLAT]:[err] }))
            .toStrictEqual({
                level: 'info',
                message: 'Trigger error',
                metadata: {
                    exception: {
                        message: "Error: Testing exception",
                        trace: ['trace1', 'trace2', 'trace3']
                    }
                },
                [LEVEL]: 'info',
                [MESSAGE]: "Error: Testing exception",
                [SPLAT]:[err]
            })
    })

    test('Check result when there\'s not exception', () => {
        expect(exception().transform({ level: 'info', message: 'Trigger error'}))
        .toStrictEqual({
            level: 'info',
            message: 'Trigger error'
        })
    })
})


