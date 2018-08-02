import {expect} from 'chai'
import path from 'path'
import fs from 'fs-extra'
import _eval from 'eval'
import {e2eHelper} from '../e2e-helper'
import {setup} from '../envs-test-utils'
describe('babel', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture')
    const compilerPath = path.resolve(__dirname, '../../dist/babel/babel.js')
    const helper = e2eHelper({baseFixturePath,
        mainFile:'b.js',
        compilerName:'babel',
        confName: '.babelrc',
        compilerPath})
    before(function () {
        setup(this, [baseFixturePath])
        this.timeout(1000 * 1000)
        helper.before()
    })
    after(function () {
        helper.after()
    })
    it('bit should transpile component with babel meta compiler', function () {
        const transpiled = fs.readFileSync(path.resolve(baseFixturePath, 'dist/b.js')).toString()
        expect(_eval(transpiled).run()).to.equal(0)
    })
})
