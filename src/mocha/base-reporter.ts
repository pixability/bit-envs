import {Runner , Stats, Test} from 'mocha'
import _get from 'lodash.get'

export function Base(this:any, runner:Runner) {
    // let stats = getEmptyStats()
    const failures:Array<Test> = this.failures = []

    if (!runner) {
        return
    }
    this.runner = runner

    runner.stats = getEmptyStats()

    runner.on('start', function () {
        runner.stats!.start = new Date()
    })

    runner.on('suite', function (suite) {
        runner.stats!.suites = runner.stats!.suites || 0
        suite.root || runner.stats!.suites++
    })

    runner.on('test end', function () {
        runner.stats!.tests = runner.stats!.tests || 0
        runner.stats!.tests++
    })

    runner.on('pass', function (test) {
        runner.stats!.passes = runner.stats!.passes || 0
        if (!test.duration) {
            test.speed = undefined
        } else if (test.duration > test.slow()) {
            test.speed = 'slow'
        } else if (test.duration > test.slow() / 2) {
            test.speed = 'medium'
        } else {
            test.speed = 'fast'
        }

        runner.stats!.passes++
    })

    runner.on('fail', function (test, err:Error) {
        runner.stats!.failures = runner.stats!.failures || 0
        runner.stats!.failures++
        test.err = err
        failures.push(test)
    })

    runner.on('suite end', function () {
        runner.stats!.end = new Date()
        runner.stats!.duration = new Date().getMilliseconds() - (_get(runner, 'stats.start' , 0) as number)
    })

    runner.on('pending', function () {
        runner.stats!.pending++
    })

}

export function getEmptyStats() {
    return ({ suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 } as Stats)
}
