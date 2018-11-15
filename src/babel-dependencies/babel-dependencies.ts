import {
  ExtensionApiOptions,
  loadPackageJsonSync
} from '../env-utils'
import { findConfiguration, FindStrategy } from '../find-configuration'
import { defaultConfig } from './default-babel-config'
import path from 'path'

import _get from 'lodash.get'

const getNameOfAddon = (addon: string) => {
  return Array.isArray(addon) ? addon[0] : addon
}

export function getDependencies (
  names: Array<string>,
  babelType: 'plugin' | 'preset',
  packageJson: object
) {
  const dependencies = _get(packageJson, 'dependencies', {})
  const devDependencies = _get(packageJson, 'devDependencies', {})
  const peerDependencies = _get(packageJson, 'peerDependencies', {})
  const packagesInPkgJson = Object.assign({},
    peerDependencies,
    devDependencies,
    dependencies
  )
  return names
    .reduce((pkgNamesAndVersions: any, name: string) => {
      const addonName = getNameOfAddon(name)
      if (path.isAbsolute(addonName)) {
        // since we only need to return names, if this is an absolute path
        // we do not deal with it here (at the time of this writing, we
        // require those packages as part of the environment)
        return pkgNamesAndVersions
      }
      const pkgName = findBabelNameInDeps(name, babelType, packagesInPkgJson)
      if (!pkgName) {
        throw new Error(`could not find package for ${babelType} ${name}`)
      }
      return Object.assign({}, pkgNamesAndVersions, {
        [pkgName]: packagesInPkgJson[pkgName]
      })
    }, {})
}

export function findBabelNameInDeps (
  name: string,
  babelType: 'plugin' | 'preset',
  dependencies: any
) {
  const addonName = getNameOfAddon(name)
  const possiblePackageNames = getPossiblePkgNames(addonName, babelType)
  return possiblePackageNames.find(name => dependencies[name])
}

export function findBabelPluginNames (plugins?: Array<string>) {
  return (plugins || []).map(getNameOfAddon)
}

export function getBabelPackageDependencies (
  name = '.babelrc',
  info: ExtensionApiOptions
) {
  const babelrcFromFind = babelFindConfiguration(info, name)
  const babelrc = _get(
    babelrcFromFind,
    'config.babel',
    babelrcFromFind.config
  )
  const pluginNames = babelrc.plugins || []
  const presetNames = babelrc.presets || []
  const workspaceDir = info.context && info.context.workspaceDir
  const componentDir = info.context && info.context.componentDir
  const packageJson = loadPackageJsonSync(componentDir, workspaceDir || '')
  const pluginDeps = getDependencies(pluginNames, 'plugin', packageJson)
  const presetDeps = getDependencies(presetNames, 'preset', packageJson)
  return Object.assign({},
    pluginDeps,
    presetDeps
  )
}

export function getPossiblePkgNames (
  pkgName: string,
  pkgType: 'plugin' | 'preset'
) {
  const prefixes = [`@babel/${pkgType}-`, `babel-${pkgType}-`, '@babel/']
  const startsWithPrefixes = prefixes.map(p => new RegExp(`^${p}`))
  const normalizedName = startsWithPrefixes
    .reduce((pluginName, prefix) => {
      return pluginName.replace(prefix, '')
    }, pkgName)
  return prefixes.map(p => `${p}${normalizedName}`)
}

export function babelFindConfiguration (
  info: ExtensionApiOptions,
  name: string
) {
  const useDefaultConfig = _get(info, 'rawConfig.useDefaultConfig')
  if (useDefaultConfig) {
    return findConfiguration(info, {
      [FindStrategy.default]: defaultConfig
    })
  } else {
    return findConfiguration(info, {
      [FindStrategy.pjKeyName]: 'babel',
      [FindStrategy.fileName]: name,
      [FindStrategy.default]: defaultConfig,
      [FindStrategy.defaultFilePaths]: ['./.babelrc', './babel.config.js']
    })
  }
}
