import {expect} from 'chai'
import path from 'path'
import fs from 'fs-extra'
import {e2eHelper} from '../e2e-helper'
import { setup, generatePackageJson } from '../envs-test-utils';
import packageJSON from './private-package-json-e2e'

describe('webpack', function() {
    const baseFixturePath = path.resolve(__dirname, './fixture-e2e')
    const compilerPath = path.resolve(__dirname, '../../dist/src/webpack')
    const helper = e2eHelper({
        baseFixturePath,
        mainFile:'index.js',
        compilerName:'webpack',
        confName:['webpack.config.js', '.babelrc'],
        compilerPath
    })
    before(function() {
        generatePackageJson({[baseFixturePath]:packageJSON})
        setup(this, [baseFixturePath])
        this.timeout(1000 * 1000)
        helper.before()
    })
    after(function() {
        helper.after()
    })
    it('bit should bundle a component with webpack meta bundler', function() {
        const bundle = fs.readFileSync(path.resolve(baseFixturePath, 'dist/main.bundle.js')).toString()
        expect(eval(bundle).run()).to.equal(0)
    })
})
