import { CompilerExtension, API, ExtensionApiOptions } from "./types"
import Vinyl from 'vinyl'
import { loadPackageJsonSync, getVersion } from './compiler-utils'
import resolve from 'resolve'
import path from 'path'
import * as babel from 'babel-core'

export function CreateBabelCompiler() {
    const MetaBabelCompiler: CompilerExtension = {
        init: function ({ api }: { api: API }) {
            MetaBabelCompiler.logger = api.getLogger()
            return {
                write: false
            }
        },
        action: function (info: ExtensionApiOptions) {
            const vinylBabelrc = getFileByName('.babelrc', info.configFiles)
            if (!vinylBabelrc) {
                MetaBabelCompiler.logger.log('could not find .babelrc')
                throw new Error('could not find .babelrc')
            }
            const rawBabelrc = vinylBabelrc!.contents!.toString()
            const babelrc = JSON.parse(rawBabelrc)
            const componentDir = info.context && info.context.componentDir

            if (componentDir) {
                babelrc.plugins = babelrc.plugins.map((pluginName: string |Array<any>) => {
                    const actualPluginName = Array.isArray(pluginName) ? pluginName[0]:pluginName
                    return resolvePlugin(componentDir, actualPluginName)
                })
                babelrc.presets = babelrc.presets.map((presetName: string) => resolvePreset(componentDir, presetName))
            }

            try {
                const builtFiles: Array<Vinyl> = info.files.map((file:any) => runBabel(file, babelrc, info.context.rootDistFolder))
                    .reduce((a:any, b:any) => a.concat(b))
                return Promise.resolve({ files: builtFiles })
            } catch (e) {
                throw e
            }
        },
        getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
            const dynamicPackageDependencies = {}
            const vinylBabelrc = getFileByName('.babelrc', info.configFiles)
            if (!vinylBabelrc) {
                MetaBabelCompiler.logger.log('could not find .babelrc')
                throw new Error('could not find .babelrc')
            }
            const rawBabelrc = vinylBabelrc!.contents!.toString()
            const babelrc = JSON.parse(rawBabelrc)
            const pluginsNames = babelrc.plugins && babelrc.plugins.map((name:string|Array<any>)=>Array.isArray(name) ? name[0]: name) || []
            const presetsNames = babelrc.presets || []
            const addParsedNameToResult = (result: any, packageJson: any, nameToPackageFn: any) => (name: any) => {
                const packageName = nameToPackageFn(name)
                const packageVersion = getPackageVersion(packageName, packageJson)
                result[packageName] = packageVersion
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
    return MetaBabelCompiler
}


function getFileByName(name: string, files: Array<Vinyl>) {
    return files.find((file) => (file.name === name))
}

function getPackageVersion(packageName: string , packageJson: any) {
    if (!packageName) {
        throw new Error('missing package name argument')
    }
    if (!packageJson) {
        throw new Error('missing package.json file')
    }
    const version = getVersion(packageJson, packageName)

    if (!version) {
        throw new Error(`${packageName} not found in package.json file`)
    }
    return version
}

function getPluginPackageName(pluginName: string) {
    const prefix = 'babel-plugin'
    return getPrefixedPackageName(pluginName, prefix)
}

function getPresetPackageName(pluginName: string) {
    const prefix = 'babel-preset'
    return getPrefixedPackageName(pluginName, prefix)
}

function getPrefixedPackageName(pluginName: string, prefix: string) {
    return pluginName.indexOf(prefix) !== 0 ? `${prefix}-${pluginName}` : pluginName
}
function resolvePlugin(componentDir: string, pluginName: string) {
    const resolvedName = getPluginPackageName(pluginName)
    return resolvePackagesFromComponentDir(componentDir, resolvedName)
}

function resolvePreset(componentDir: string, presetName: string) {
    const resolvedName = getPresetPackageName(presetName)
    return resolvePackagesFromComponentDir(componentDir, resolvedName)
}

function resolvePackagesFromComponentDir(componentDir: string, packagName: string) {
    // This might be done using the paths option in node's built in require.resolve function
    // but this option is only supported since node v8.9.0 so in order to support older versions
    // we used this package
    // const resolvedPackage = require.resolve(packagName, { paths: [componentDir] })
    const resolvedPackage = resolve.sync(packagName, { basedir: componentDir })
    return resolvedPackage
}

function runBabel(file:any, options:any, distPath:string) {
    const { code, map } = babel.transform(file.contents.toString(), options)
    const mappings = new Vinyl({
        contents: Buffer.from((map as any).mappings),
        base: distPath,
        path: path.join(distPath, file.relative),
        basename: `${file.basename}.map`
    })
    const distFile = file.clone()
    distFile.base = distPath
    distFile.path = path.join(distPath, file.relative)
    distFile.contents = code ? Buffer.from(`${code}\n\n//# sourceMappingURL=${mappings.basename}`) : Buffer.from(code!)
    return [mappings, distFile]
}

export default CreateBabelCompiler()
