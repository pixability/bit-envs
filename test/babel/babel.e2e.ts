/// <reference path='eval.d.ts' />
import {expect} from 'chai'
import path from 'path'
import fs from 'fs-extra'
import _eval from 'eval'
import {e2eHelper} from '../e2e-helper'
import {setup, generatePackageJson} from '../envs-test-utils'
import packageJSON from './private-package-json'

describe('babel', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture')
    const compilerPath = path.resolve(__dirname, '../../dist/src/babel')
    const helper = e2eHelper({baseFixturePath,
        mainFile:'b.js',
        compilerName:'babel',
        confName: ['.babelrc'],
        compilerPath})
    before(function () {
        generatePackageJson({[baseFixturePath]:packageJSON})
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
