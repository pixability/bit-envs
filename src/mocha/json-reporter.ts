import { Runner, Test ,Reporter} from 'mocha'
import {Base, getEmptyStats} from './base-reporter'
import {TestResult} from '../env-utils/types'
import _get from 'lodash.get'
/***
 * Initialize a new `JSON` reporter.
 *
 * @api public
 * @param {Runner} runner
 */
export function JSONReporter(this:Reporter, runner: Runner) {
    Base.call(this, runner)

    const flattenResult:{[k:string]:Array<any>} = {}

    let tests: Array<Test>
    let pending: Array<Test>
    let failures: Array<Test>
    let passes: Array<Test>

    function init () {
        tests = []
        pending = []
        failures = []
        passes = []
    }
    init()
    runner.on('test end', function (test) {
        tests.push(test)
    })

    runner.on('pass', function (test) {
        passes.push(test)
    })

    runner.on('fail', function (test) {
        failures.push(test)
    })

    runner.on('pending', function (test) {
        pending.push(test)
    })

    runner.on('suite end', function () {
        if (_get(flattenResult, 'runner.currentRunnable.file')){
            throw new Error('Could not find test suite original runner')
        }
        if (!tests.length    &&
            !pending.length  &&
            !failures.length &&
            !passes.length){
                return;
        }
        const obj = {
            stats: runner.stats,
            tests: tests.map(clean),
            pending: pending.map(clean),
            failures: failures.map(clean),
            passes: passes.map(clean)
        }

        Array.isArray(flattenResult[runner.currentRunnable!.file!]) ?
            flattenResult[runner.currentRunnable!.file!].push(obj) :
            flattenResult[runner.currentRunnable!.file!] = [obj]

        init()
        runner.stats = getEmptyStats()
    })

    runner.on('end', function (this:Runner) {
        (this as any).testResults = flattenResult
    })

}


function clean(test: Test):TestResult {
    return {
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration,
        currentRetry: (test as any).currentRetry(),
        err: errorJSON(test.err || {})
    }
}
function errorJSON(err: Error | {}) {
    const res:{[key:string]:string} = {}
    Object.getOwnPropertyNames(err).forEach(function (key) {
        res[key] = (err as any)[key]
    }, err)
    return res
}
