import { expect } from 'chai'
import path from 'path'
import fs from 'fs-extra'
import { e2eHelper } from '../e2e-helper'
import { createEnvironment } from '../envs-test-utils'
import packageJSON from './private-package-json-e2e'
import _eval from 'eval'

const compilerPath = path.resolve(__dirname, '../../dist/src/webpack')
const confName = ['webpack.config.js', '.babelrc']

const compilerEnvDefaults = {
  mainFile: 'index.js',
  compilerName: 'webpack',
  confName,
  compilerPath
}

describe('webpack', function () {
  this.timeout(1000 * 1000)
  afterEach(function () {
    this.helper && this.helper.after && this.helper.after()
  })
  it('bit should bundle a component with webpack meta bundler', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-e2e')
    this.helper = e2eHelper(Object.assign({}, compilerEnvDefaults, {
      baseFixturePath
    }))
    createEnvironment(baseFixturePath, packageJSON)
    this.helper.before()
    const bundle = fs
      .readFileSync(path.resolve(baseFixturePath, 'dist/main.bundle.js'))
      .toString()
    expect(_eval(bundle).run()).to.equal(0)
  })
  it('bit should allow config override with webpack bundler', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-override')
    const compilerConfig = {
      webpackCompiler: {
        rawConfig: {
          useDefaultConfig: true
        },
        options: {
          file: compilerPath
        }
      }
    }
    this.helper = e2eHelper(Object.assign({}, compilerEnvDefaults, {
      baseFixturePath, compilerConfig
      // baseFixturePath
    }))
    createEnvironment(baseFixturePath, packageJSON)
    this.helper.before()
    const bundle = fs
      .readFileSync(path.resolve(baseFixturePath, 'dist/main.bundle.js'))
      .toString()
    expect(_eval(bundle.replace(/window/, 'global')).run()).to.equal(0)
  })
})
