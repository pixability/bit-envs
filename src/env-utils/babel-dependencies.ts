import { Logger, ExtensionApiOptions } from "./types";
import { findByName, fillDependencyVersion, loadPackageJsonSync } from "./compiler-utils";

export function getBabelDynamicPackageDependencies(logger:Logger, name = '.babelrc') {
    return function (info: ExtensionApiOptions) {
        const dynamicPackageDependencies = {}
        const vinylBabelrc = findByName(info.configFiles, name)
        if (!vinylBabelrc) {
            logger.log('could not find ', name)
            throw new Error('could not find ' + name)
        }
        const rawBabelrc = vinylBabelrc!.contents!.toString()
        const babelrc = JSON.parse(rawBabelrc)
        const pluginsNames = babelrc.plugins && babelrc.plugins.map((name:string|Array<string>)=> Array.isArray(name) ? name[0]: name) || []
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
