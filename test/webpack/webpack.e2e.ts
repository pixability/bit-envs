import {expect} from 'chai'
import path from 'path'
import fs from 'fs-extra'
import {e2eHelper} from '../e2e-helper'
import { setup } from '../envs-test-utils';

describe('webpack', function() {
    const baseFixturePath = path.resolve(__dirname, './fixture-e2e')
    const compilerPath = path.resolve(__dirname, '../../dist/webpack/webpack.js')
    console.log(compilerPath)
    const helper = e2eHelper({
        baseFixturePath,
        mainFile:'index.ts',
        compilerName:'webpack',
        confName:'webpack.config.js',
        compilerPath
    })
    before(function() {
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
