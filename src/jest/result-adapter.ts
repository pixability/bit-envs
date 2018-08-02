import _isEmpty from 'lodash.isempty'

export function convertJestFormatToBitFormat(results: any) {
    const testResults = results.testResults
    let failures: Array<any> = []
    let testProps: Array<any> = []
    const res = testResults.map((test: any) => {
        const duration = test.endTime - test.startTime
        if (_isEmpty(test.assertionResults)) {
            failures.push({
                title: 'Test suite failed to run',
                err: {
                    message: test.message
                },
                duration: duration
            })
        } else {
            testProps = test.assertionResults.map((assertionRes: any) => {
                const title = assertionRes.title
                const pass = assertionRes.status === 'passed' ? true : false
                const err = !pass
                    ? {
                          message: assertionRes.failureMessages[0],
                          stack: assertionRes.failureMessages[0]
                      }
                    : undefined
                if (err)
                    return {
                        title,
                        pass,
                        duration,
                        err
                    }
                return {
                    title,
                    pass,
                    duration
                }
            })
        }
        const StatsProps = {
            start: test.startTime,
            end: test.endTime,
            duration: duration
        }
        const pass = test.status === 'passed' ? true : false
        return {
            tests: testProps,
            stats: StatsProps,
            pass,
            failures,
            specPath: test.name
        }
    })
    return res
}

export default convertJestFormatToBitFormat
