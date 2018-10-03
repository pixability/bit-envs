import { Logger, ExtensionApiOptions } from './types';
import { fillDependencyVersion, loadPackageJsonSync } from './compiler-utils';
import { findConfiguration, FindStrategy } from './find-configuration';
import {defaultConfig} from './default-babel-config'

import _get from 'lodash.get'

export function getBabelDynamicPackageDependencies(_logger:Logger, name = '.babelrc') {
    return function (info: ExtensionApiOptions) {
        const dynamicPackageDependencies = {}
        const babelrcFromfind = babelFindConfiguration(info, name)
        const babelrc = _get(babelrcFromfind, 'config.babel', babelrcFromfind.config)

        const pluginsNames = babelrc.plugins ?
            babelrc.plugins.map((pluginName:string|Array<string>)=> Array.isArray(pluginName) ? pluginName[0]: pluginName) :
            []
        const presetsNames = babelrc.presets || []
        const addParsedNameToResult = (result: {[key:string]:string}, packageJson: object, nameToPackageFn: (name:string) => string) => (name: string) => {
            const packageName = nameToPackageFn(name)
            fillDependencyVersion(packageJson, packageName, result)
        }
        if (pluginsNames.length || presetsNames.length) {
            const workspaceDir = info.context && info.context.workspaceDir
            const componentDir = info.context && info.context.componentDir
            const packageJson = loadPackageJsonSync(componentDir, workspaceDir)
            pluginsNames.map(addParsedNameToResult(dynamicPackageDependencies, packageJson, getPluginPackageName))
            presetsNames.map(addParsedNameToResult(dynamicPackageDependencies, packageJson, getPresetPackageName))
        }

        return dynamicPackageDependencies
    }
}

export function getPluginPackageName(pluginName: string) {
    const prefix = 'babel-plugin'
    return getPrefixedPackageName(pluginName, prefix)
}

export function getPresetPackageName(pluginName: string) {
    const prefix = 'babel-preset'
    return getPrefixedPackageName(pluginName, prefix)
}

export function getPrefixedPackageName(pluginName: string, prefix: string) {
    return pluginName.indexOf(prefix) !== 0 ? `${prefix}-${pluginName}` : pluginName
}


export function babelFindConfiguration(info:ExtensionApiOptions, name:string){
    return findConfiguration(info, {
        [FindStrategy.pjKeyName]: 'babel',
        [FindStrategy.fileName]: name,
        [FindStrategy.default]: defaultConfig,
        [FindStrategy.defaultFilePaths]: ['./.babelrc', './babel.config.js'],
    })
}
