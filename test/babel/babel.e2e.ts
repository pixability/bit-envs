/// <reference path='eval.d.ts' />
import { expect } from 'chai'
import path from 'path'
import fs from 'fs-extra'
import _eval from 'eval'
import { e2eHelper } from '../e2e-helper'
import { createEnvironment } from '../envs-test-utils'
import packageJSON from './private-package-json'

const compilerPath = path.resolve(__dirname, '../../dist/src/babel')

const testEnvDefaults = {
  mainFile: 'b.js',
  compilerName: 'babel',
  compilerPath
}

describe('babel', function () {
  this.timeout(1000 * 1000)
  afterEach(function () {
    this.helper && this.helper.after && this.helper.after()
    this.helper = null
  })
  it('bit should transpile component with babel meta compiler', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture')
    this.helper = e2eHelper(
      Object.assign({}, testEnvDefaults, {
        baseFixturePath,
        confName: ['.babelrc']
      })
    )
    createEnvironment(baseFixturePath, packageJSON)
    this.helper.before()
    const transpiled = fs
      .readFileSync(path.resolve(baseFixturePath, 'dist/b.js'))
      .toString()
    expect(_eval(transpiled).run()).to.equal(0)
  })
  it('bit should transpile component with default babelrc', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-default-config')
    this.helper = e2eHelper(
      Object.assign({}, testEnvDefaults, {
        baseFixturePath,
        confName: []
      })
    )
    createEnvironment(baseFixturePath, packageJSON)
    this.helper.before()
    const transpiled = fs
      .readFileSync(path.resolve(baseFixturePath, 'dist/b.js'))
      .toString()
    expect(_eval(transpiled).run()).to.equal(0)
  })
  it('bit should allow overriding babelrc', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-override')
    const compilerConfig = {
      metaBabel: {
        rawConfig: {
          useDefaultConfig: true
        },
        options: {
          file: compilerPath
        }
      }
    }
    this.helper = e2eHelper(
      Object.assign({}, testEnvDefaults, {
        baseFixturePath,
        compilerConfig,
        confName: []
      })
    )
    createEnvironment(baseFixturePath, packageJSON)
    this.helper.before()
    const transpiled = fs
      .readFileSync(path.resolve(baseFixturePath, 'dist/b.js'))
      .toString()
    expect(_eval(transpiled).run()).to.equal(0)
  })
  it('bit should give the option not to compile certain globs', function () {
    const baseFixturePath = path.resolve(__dirname, './fixture-skipcompile')
    const compilerConfig = {
      metaBabel: {
        rawConfig: {
          skipCompile: ['**/*.flow']
        },
        options: {
          file: compilerPath
        }
      }
    }
    this.helper = e2eHelper(
      Object.assign({}, testEnvDefaults, {
        baseFixturePath,
        compilerConfig,
        confName: ['.babelrc'],
        compFiles: ['foo.js.flow']
      })
    )
    createEnvironment(baseFixturePath, packageJSON)
    this.helper.before()
    const transpiled = fs
      .readFileSync(path.resolve(baseFixturePath, 'dist/b.js'))
      .toString()
    const transpiledFoo = fs.readFileSync(
      path.resolve(baseFixturePath, 'dist/foo.js.flow')
    )
    const origFoo = fs.readFileSync(
      path.resolve(baseFixturePath, 'foo.js.flow')
    )
    expect(_eval(transpiled).run()).to.equal(0)
    expect(transpiledFoo.toString()).to.equal(origFoo.toString())
  })
})
