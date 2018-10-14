import { expect } from 'chai'
import path from 'path'
import { e2eHelper } from '../e2e-helper'
import { setup, generatePackageJson } from '../envs-test-utils'
import packageJSON from './private-package-json'

describe('mocha', function () {
  const baseFixturePath = path.resolve(__dirname, './fixture')
  const compilerPath = path.resolve(__dirname, '../../dist/src/babel')
  const testerPath = path.resolve(__dirname, '../../dist/src/mocha')
  const testerConfig = {
    [`meta-tester`]: {
      rawConfig: {
        require: ['babel-core/register', 'source-map-support/register'],
        filesRequire: ['setup.js']
      },
      options: {
        file: testerPath
      }
    }
  }
  const helper = e2eHelper({
    baseFixturePath,
    mainFile: 'index.js',
    compilerName: 'babel',
    confName: ['.babelrc'],
    compilerPath,
    testerPath,
    compFiles: ['index.js', 'add.js', 'sub.js', 'setup.js'],
    testFiles: ['test.spec.js'],
    testerConfig
  })
  let mainCommandResult = ''
  before(function () {
    generatePackageJson({ [baseFixturePath]: packageJSON })
    setup(this, [baseFixturePath])
    this.timeout(1000 * 1000)
    mainCommandResult = helper.before().toString()
  })
  after(function () {
    helper.after()
  })
  it('bit should test component with mocha meta tester', function () {
    expect(mainCommandResult).to.contain('tests passed')
    expect(mainCommandResult).to.not.contain('tests failed')
  })
})
