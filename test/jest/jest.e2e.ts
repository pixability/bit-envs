import path from 'path'
import { expect } from 'chai'
import { e2eHelper } from '../e2e-helper'
import { createEnvironment } from '../envs-test-utils'
import packageJSON from './private-package-json'

const testerPath = path.resolve(__dirname, '../../dist/src/jest')

const testEnvDefaults = {
  mainFile: 'index.ts',
  compilerName: '',
  confName: ['./jest.config.js'],
  compilerPath: '',
  testerPath,
  compFiles: ['index.ts', 'add.ts', 'sub.ts', 'setup.ts'],
  testFiles: ['test.spec.ts', 'test2.spec.ts']
}

describe('jest', function () {
  this.timeout(1000 * 1000)
  afterEach(function () {
    this.helper && this.helper.after && this.helper.after()
    this.helper = null
  })
  it('bit should test component with jest meta tester', async function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-e2e')
    this.helper = e2eHelper(Object.assign({}, testEnvDefaults, {
      baseFixturePath
    }))
    createEnvironment(baseFixturePath, packageJSON)
    const mainCommandResult = this.helper.before().toString()
    expect(mainCommandResult).to.contain('tests passed')
    expect(mainCommandResult).to.not.contain('tests failed')
  })
  it('bit should allow overriding jest configuration', async function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-override')
    const testerConfig = {
      [`meta-tester`]: {
        rawConfig: {
          useDefaultConfig: true
        },
        options: {
          file: testerPath
        }
      }
    }
    this.helper = e2eHelper(
      Object.assign({}, testEnvDefaults, { baseFixturePath, testerConfig }, {
        testFiles: ['__tests__/test.spec.js'],
        compFiles: ['index.js', 'add.js', 'sub.js', 'setup.js'],
        mainFile: 'index.js'
      })
    )
    createEnvironment(baseFixturePath, packageJSON)
    const mainCommandResult = this.helper.before().toString()
    expect(mainCommandResult).to.contain('tests passed')
    expect(mainCommandResult).to.not.contain('tests failed')
  })
})
