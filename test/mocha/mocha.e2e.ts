import { expect } from 'chai'
import path from 'path'
import { e2eHelper } from '../e2e-helper'
import { installPaths, generatePackageJson } from '../envs-test-utils'
import packageJSON from './private-package-json'

const compilerPath = path.resolve(__dirname, '../../dist/src/babel')
const testerPath = path.resolve(__dirname, '../../dist/src/mocha')

function createEnvironment (baseFixturePath: string) {
  generatePackageJson({ [baseFixturePath]: packageJSON })
  installPaths([baseFixturePath])
}

function createHelper (
  testerConfig: object,
  testFiles: Array<string>,
  baseFixturePath: string
) {
  createEnvironment(baseFixturePath)
  return e2eHelper({
    baseFixturePath,
    mainFile: 'index.js',
    compilerName: 'babel',
    confName: ['.babelrc'],
    compilerPath,
    testerPath,
    compFiles: ['index.js', 'add.js', 'sub.js', 'setup.js'],
    testFiles,
    testerConfig
  })
}

describe('mocha', function () {
  this.timeout(1000 * 1000)
  afterEach(function () {
    this.helper && this.helper.after && this.helper.after()
    this.helper = null
  })
  it('bit should test component with mocha meta tester', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture')
    const testFiles = ['test.spec.js']
    const testerConfig = {
      [`meta-tester`]: {
        rawConfig: {
          require: ['babel-core/register', 'source-map-support/register']
        },
        options: {
          file: testerPath
        }
      }
    }
    this.helper = createHelper(testerConfig, testFiles, baseFixturePath)
    const mainCommandResult = this.helper.before().toString()
    expect(mainCommandResult).to.contain('tests passed')
    expect(mainCommandResult).to.not.contain('tests failed')
  })
  it('bit should use options from mocha.opts', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-mocha-opts')
    const testFiles = ['test.spec.js', 'other-test.spec.js']
    const testerConfig = {
      [`meta-tester`]: {
        rawConfig: {
          require: ['babel-core/register', 'source-map-support/register']
        },
        options: {
          file: testerPath
        }
      }
    }
    this.helper = createHelper(testerConfig, testFiles, baseFixturePath)
    const mainCommandResult = this.helper.before().toString()
    expect(mainCommandResult).to.contain('tests passed')
    expect(mainCommandResult).to.not.contain('tests failed')
  })
  it('bit should support requiring from mocha.opts', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-mocha-require')
    const testFiles = ['other-test.spec.js']
    const testerConfig = {
      [`meta-tester`]: {
        files: ['./setup.js'],
        rawConfig: {
          require: ['babel-core/register', 'source-map-support/register']
        },
        options: {
          file: testerPath
        }
      }
    }
    this.helper = createHelper(testerConfig, testFiles, baseFixturePath)
    const mainCommandResult = this.helper.before().toString()
    expect(mainCommandResult).to.contain('tests passed')
    expect(mainCommandResult).to.not.contain('tests failed')
  })
  it('bit should error when missing requires in mocha.opts', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-mocha-require')
    const testFiles = ['other-test.spec.js']
    const testerConfig = {
      [`meta-tester`]: {
        rawConfig: {
          require: ['babel-core/register', 'source-map-support/register']
        },
        options: {
          file: testerPath
        }
      }
    }
    this.helper = createHelper(testerConfig, testFiles, baseFixturePath)
    expect(this.helper.before).to.throw('Command failed')
  })
})
