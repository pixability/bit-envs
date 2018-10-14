import path from 'path'
import { expect } from 'chai'
import { CreateMochaTester } from '../../src/mocha'
import {
  createApi,
  createFiles,
  setup,
  generatePackageJson
} from '../envs-test-utils'
import { getVersion } from '../../src/env-utils'
import packageJSON from './private-package-json'

describe('mocha', function () {
  const baseFixturePath = path.resolve(__dirname, './fixture')
  before(function () {
    generatePackageJson({ [baseFixturePath]: packageJSON })
    setup(this, [baseFixturePath])
  })
  it('init', function () {
    const tester = CreateMochaTester()
    const options = tester.init({ api: createApi() })
    expect(!!tester.logger).to.equal(true)
    expect(!!options.write).to.equal(false)
  })
  describe('getDynamicPackageDependencies', function () {
    this.timeout(5000)
    it('getDynamicPackageDependencies', function () {
      const tester = CreateMochaTester()
      const context = {
        componentDir: baseFixturePath
      }
      tester.init({
        api: createApi()
      })

      const dynamicConfig = {
        require: ['babel-core/register', 'source-map-support/register'],
        filesRequire: ['setup.js']
      }
      const results = tester.getDynamicPackageDependencies({
        configFiles: [],
        context,
        dynamicConfig
      })

      const packageJSON = require(path.resolve(
        baseFixturePath,
        './package.json'
      ))
      expect(results).to.contain({
        'babel-core': getVersion(packageJSON, 'babel-core'),
        'source-map-support': getVersion(packageJSON, 'source-map-support')
      })
    })
  })

  it('action', function () {
    const tester = CreateMochaTester()
    const testFiles = createFiles(baseFixturePath, [
      '.babelrc',
      'package.json',
      'package-lock.json',
      '.gitignore'
    ])
    const actionInfo = {
      testFiles,
      configFiles: [],
      dynamicConfig: {
        require: ['babel-core/register', 'source-map-support/register'],
        filesRequire: ['setup.js']
      },
      context: {
        componentDir: baseFixturePath,
        componentObject: {
          mainFile: ''
        },
        rootDistDir: path.resolve(baseFixturePath, './dist')
      }
    }
    tester.init({
      api: createApi()
    })
    return tester.action(actionInfo).then(function (results) {
      expect((global as any).mochaSetupTestRun, 'setup.js').to.equal(true)
      const babelCore = Object.keys(require.cache).find(
        elem => !!~elem.indexOf('babel-core/register')
      )
      expect(babelCore, 'babel-core').to.contain('fixture')
      const withFailures = results.find(item =>
        item.specPath.endsWith('test2.spec.js')
      )
      const allPassing = results.find(item =>
        item.specPath.endsWith('test.spec.js')
      )
      expect(withFailures.failures.length).to.equal(3)
      expect(allPassing.failures.length).to.equal(0)
    })
  })
  it('should support dynamic config lookup', function () {
    const tester = CreateMochaTester()
    const testFiles = createFiles(baseFixturePath, [
      '.babelrc',
      'package.json',
      'package-lock.json',
      '.gitignore'
    ])
    const actionInfo = {
      testFiles,
      configFiles: [],
      dynamicConfig: {
        require: ['babel-core/register', 'source-map-support/register'],
        filesRequire: ['setup.js']
      },
      rawConfig: { foo: 'bar' },
      context: {
        componentDir: baseFixturePath,
        componentObject: {
          mainFile: ''
        },
        rootDistDir: path.resolve(baseFixturePath, './dist')
      }
    }
    tester.init({
      api: createApi()
    })
    let config = tester.getDynamicConfig!(actionInfo)
    expect(config).to.deep.equal(actionInfo.rawConfig)
  })
})
