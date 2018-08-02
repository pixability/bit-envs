import path from 'path'
import {expect} from 'chai'
import {e2eHelper} from '../e2e-helper'
import { npmInstallFixture } from '../envs-test-utils';

describe('jest', function (){
    const baseFixturePath = path.resolve(__dirname, './fixture-action')
    const compilerPath = ''
    const testerPath = path.resolve(__dirname, '../../dist/jest/jest.js')
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
        npmInstallFixture(this, [baseFixturePath])
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
