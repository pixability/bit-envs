import {
  TesterExtension,
  ExtensionApiOptions,
  API,
  ActionTesterOptions
} from '../env-utils/types'
import {
  loadPackageJsonSync,
  fillDependencyVersion,
  createPrivateRequire,
  cleanPrivateRequire
} from '../env-utils'
import { FindStrategy, findConfiguration } from '../../src/find-configuration'
import { JSONReporter } from './json-reporter'
import Mocha, { Test } from 'mocha'
import _get from 'lodash.get'
import path from 'path'

export function CreateMochaTester (): TesterExtension {
  const metaMocha: TesterExtension = {
    init: function ({ api }: { api: API }) {
      metaMocha.logger = api.getLogger()
      return {
        write: false
      }
    },
    getDynamicConfig: function (info: ActionTesterOptions) {
      const config = mochaFindConfiguration(info)
      const rawConfigFilesRequire = _get(info, 'rawConfig.filesRequire', [])
      const rawConfigRequire = _get(info, 'rawConfig.require', [])
      const configuredRequire =
        config.save && config.config && config.config.mochaRequire
      const isFileRequire =
        configuredRequire && configuredRequire.startsWith('./')
      return config.save
        ? Object.assign({}, config.config, {
          filesRequire: configuredRequire && isFileRequire
            ? rawConfigFilesRequire.concat(configuredRequire)
            : rawConfigFilesRequire,
          require: configuredRequire && !isFileRequire
            ? rawConfigRequire.concat(configuredRequire)
            : rawConfigRequire
        })
        : info.rawConfig
    },
    action: function (info: ActionTesterOptions) {
      const correctFolder =
        info.context.componentDir || info.context.workspaceDir
      const privateRequire = createPrivateRequire(correctFolder)
      _get(info, 'dynamicConfig.require', []).forEach(function (
        toRequire: string
      ) {
        privateRequire(toRequire)
      })
      _get(info, 'dynamicConfig.filesRequire', []).forEach(function (
        toRequire: string
      ) {
        require(path.resolve(correctFolder, toRequire))
      })
      cleanPrivateRequire(correctFolder)
      const configFromFind = mochaFindConfiguration(info)
      const config = _get(configFromFind, 'config.mocha', configFromFind.config)
      Object.assign(config, { reporter: JSONReporter as any })
      try {
        return new Promise(resolve => {
          const mocha = new Mocha(config)

          info.testFiles.forEach(testFile => {
            mocha.addFile(testFile.path)
          })
          const runner = mocha.run(() => {
            // we can't use mocha.run().on('end') here because if tests are
            // synchronous and quick enough (eg. an empty or misconfigured test
            // suite), it causes a race condition which means the listener
            // is added after the event has fired, and so tests hang
            const results = _get(runner, 'testResults', [])
            const rawResults = [].concat.apply(
              [],
              Object.keys(results).map(function (item) {
                return results[item].map(function (describerResult: any) {
                  return normalizeResults(describerResult, item)
                })
              })
            )
            resolve(rawResults)
          })
        })
      } catch (e) {
        throw e
      }
    },
    getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
      const packages = {}
      const packageJson = loadPackageJsonSync(
        info.context.componentDir,
        info.context.workspaceDir
      )
      if (!packageJson) {
        metaMocha.logger!.error('Could not find package.json.')
        return packages
      }
      _get(info, 'dynamicConfig.require', []).forEach(function (
        mochaRequire: string
      ) {
        const requireParts = mochaRequire.split('/')
        fillDependencyVersion(packageJson, requireParts[0], packages)
      })
      return packages
    }
  }
  return metaMocha
}

const isEmptyObject = (obj: object) => Object.keys(obj).length === 0

function normalizeResults (mochaJsonResults: any, file: string) {
  function normalizeError (err: Error) {
    return {
      message: err.message,
      stack: err.stack
    }
  }

  function normalizeStats (stats: { start: number; end: number }) {
    return {
      start: stats.start,
      end: stats.end
    }
  }

  function normalizeTest (test: Test) {
    const isError = test.err && !isEmptyObject(test.err)
    return {
      title: test.fullTitle,
      pass: !isError,
      err: isError && test.err ? normalizeError(test.err) : null,
      duration: test.duration
    }
  }

  function normalizeFailure (failure: Test) {
    const isError = failure.err && !isEmptyObject(failure.err)
    return {
      title: failure.fullTitle,
      err: failure.err && isError ? normalizeError(failure.err) : null,
      duration: failure.duration
    }
  }

  return {
    tests: mochaJsonResults.tests.map(normalizeTest),
    stats: normalizeStats(mochaJsonResults.stats),
    failures: mochaJsonResults.failures.map(normalizeFailure),
    pass: mochaJsonResults.failures.length === 0,
    specPath: file
  }
}

export function mochaFindConfiguration (info: ExtensionApiOptions) {
  const fileName = 'mocha.opts'
  return findConfiguration(info, {
    [FindStrategy.pjKeyName]: 'mocha',
    [FindStrategy.default]: {},
    [FindStrategy.defaultFilePaths]: [`./test/${fileName}`]
  })
}

export default CreateMochaTester()
