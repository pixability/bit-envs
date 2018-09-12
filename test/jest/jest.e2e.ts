import path from 'path'
import {expect} from 'chai'
import {e2eHelper} from '../e2e-helper'
import { setup, generatePackageJson } from '../envs-test-utils';
import packageJSON from './private-package-json'

describe.only('jest', function (){
    const baseFixturePath = path.resolve(__dirname, './fixture-action')
    const compilerPath = ''
    const testerPath = path.resolve(__dirname, '../../dist/src/jest')
    const helper = e2eHelper({baseFixturePath,
        mainFile:'index.ts',
        compilerName:'',
        confName: 'jest.config.js',
        compilerPath,
        testerPath,
        compFiles:['index.ts', 'add.ts', 'sub.ts', 'setup.ts'],
        testFiles:['test.spec.ts', 'test2.spec.ts']
    })
    let mainCommandResult = ''
    before(function () {
        generatePackageJson({[baseFixturePath]:packageJSON})
        setup(this, [baseFixturePath])
        this.timeout(1000 * 1000)
        mainCommandResult = helper.before().toString()
    })
    after(function () {
        helper.after()
    })
    it('bit should test component with jest meta tester', function () {
        expect(mainCommandResult).to.contain('tests passed')
        expect(mainCommandResult).to.not.contain('tests failed')
    })
})
