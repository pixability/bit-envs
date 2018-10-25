import path from 'path'
import fs from 'fs-extra'
import _get from 'lodash.get'
import child_process from 'child_process'
import { defaultConfig } from './default-configuration'
import {
  TesterExtension,
  API,
  ActionTesterOptions,
  ExtensionApiOptions,
  Logger
} from '../env-utils/'
import { loadPackageJsonSync, fillDependencyVersion } from '../env-utils'
import { FindStrategy, findConfiguration } from '../../src/find-configuration'
import { convertJestFormatToBitFormat } from './result-adapter'

export default CreateJestTester()

const jestBinString = `#!/usr/bin/env node
require('jest-cli/build/cli').run()
`

export function CreateJestTester (): TesterExtension {
  const metaJest: TesterExtension = {
    init: function ({ api }: { api: API }) {
      metaJest.logger = api.getLogger()
      return {
        write: true
      }
    },

    getDynamicConfig: function (info: ActionTesterOptions) {
      let config = jestFindConfiguration(info)
      return config.save ? config.config : {}
    },
    action: function (info: ActionTesterOptions) {
      const { config } = jestFindConfiguration(info)
      const directory = getDirectory(info, metaJest.logger!)
      const resultHandler = CreateResultFileHandler(directory)
      const { executablePath, outputFile } = resultHandler.preTest()
      const testFilePath = info.testFiles.map(f => f.path)
      const testCommand = executablePath + ' ' +
        `--config '${JSON.stringify(config)}' ` +
        `--json ${testFilePath.join(' ')} ` +
        `> ${outputFile}`
      child_process.execSync(
        testCommand,
        { stdio: [] }
      )
      const results = resultHandler.getResults()
      const normalizedResults = convertJestFormatToBitFormat(results)
      resultHandler.postTest()
      return Promise.resolve(normalizedResults)
    },
    getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
      let packages = {}
      const packageJson = loadPackageJsonSync(
        info.context.componentDir,
        info.context.workspaceDir
      )
      if (!packageJson) {
        metaJest.logger!.log('Could not find package.json.')
        return packages
      }

      const configFromFind = jestFindConfiguration(info)
      const config = _get(configFromFind, 'config.jest', configFromFind.config)

      const paths = [
        'transform',
        'preset',
        'prettierPath',
        'moduleNameMapper',
        'snapshotSerializers'
      ]
      jestFindDynamicDependencies(config, paths, packageJson, packages)
      return packages
    }
  }
  return metaJest
}
function parseAndFillDependencyVersion (
  packageJson: object,
  value: string,
  toFill: { [k: string]: string }
) {
  if (~value.indexOf('node_modules')) {
    const valueParts = value.split('/')
    const packageIndex = valueParts.indexOf('node_modules')
    if (packageIndex !== valueParts.length - 1) {
      fillDependencyVersion(packageJson, valueParts[packageIndex + 1], toFill)
    }
    return
  }
  fillDependencyVersion(packageJson, value, toFill)
}

function jestFindDynamicDependencies (
  config: any,
  paths: Array<string>,
  packageJson: object,
  toFill: { [k: string]: string }
) {
  paths.forEach(function (path: string) {
    const value = _get(config, path)
    if (!value) {
      return
    }
    if (typeof value === 'string') {
      parseAndFillDependencyVersion(packageJson, value, toFill)
    } else if (value instanceof Array) {
      value.forEach(function (item: string) {
        parseAndFillDependencyVersion(packageJson, item, toFill)
      })
    } else if (typeof value === 'object') {
      Object.keys(value).forEach(function (key) {
        const internalValue = value[key]
        parseAndFillDependencyVersion(packageJson, internalValue, toFill)
      })
    }
  })
}

function CreateResultFileHandler (directory: string) { // TODO: change name
  const resultFileName = 'jestResults.json'
  const executableFilename = 'execute-jest.js'
  let outputFile = ''
  let bitTmpPath = ''
  return {
    preTest: function () {
      bitTmpPath = path.resolve(directory, '.bitTmp')
      outputFile = path.resolve(directory, '.bitTmp', resultFileName)
      const executablePath = path.resolve(
        directory, '.bitTmp', executableFilename
      )
      !fs.existsSync(bitTmpPath) && fs.mkdirpSync(bitTmpPath)
      fs.writeFileSync(executablePath, jestBinString)
      fs.chmodSync(executablePath, 0o777) // TODO: proper permissions
      return { executablePath, outputFile }
    },
    postTest: function () {
      fs.existsSync(outputFile) && fs.unlinkSync(outputFile)
      fs.emptyDir(bitTmpPath) && fs.removeSync(bitTmpPath)
    },
    getResults: function () {
      let result = null
      if (!fs.existsSync(outputFile)) {
        throw new Error('can not find ' + resultFileName)
      }
      try {
        result = fs.readJsonSync(outputFile)
      } catch (e) {
        throw new Error('result not a valid json')
      }
      return result
    }
  }
}

function getDirectory (info: ActionTesterOptions, logger: Logger) {
  const directory =
    _get(info, 'context.workspaceDir') ||
    _get(info, 'context.componentDir') ||
    _get(info, 'testFiles[0].base')
  if (!directory) {
    logger.error('Could not find test directory')
    throw new Error('Could not find test directory')
  }
  return directory
}

export function jestFindConfiguration (info: ExtensionApiOptions) {
  const useDefaultConfig = _get(info, 'rawConfig.useDefaultConfig', false)
  if (useDefaultConfig) {
    return findConfiguration(info, {
      [FindStrategy.default]: defaultConfig
    })
  } else {
    return findConfiguration(info, {
      [FindStrategy.pjKeyName]: 'jest',
      [FindStrategy.fileName]: 'jest.config.js',
      [FindStrategy.default]: defaultConfig,
      [FindStrategy.defaultFilePaths]: ['./jest.config.js']
    })
  }
}
