/// <reference path='./babel-core.d.ts' />
import { CompilerExtension, API, ExtensionApiOptions } from '../env-utils/types'
import Vinyl from 'vinyl'
import {
    // findByName,
    getBabelDynamicPackageDependencies,
    getPluginPackageName,
    getPresetPackageName,
} from '../env-utils'
import resolve from 'resolve'
import path from 'path'
import * as babel from 'babel-core'
import _get from 'lodash.get'
import { babelFindConfiguration } from '../env-utils/babel-dependencies';

export function CreateBabelCompiler(name = '.babelrc') {
    const metaBabelCompiler: CompilerExtension = {
        init: function ({ api }: { api: API }) {
            metaBabelCompiler.logger = api.getLogger()
            return {
                write: true
            }
        },
        getDynamicConfig: function(info: ExtensionApiOptions){
            let config = babelFindConfiguration(info, name)
            return config.save ? config.config : {}
        },
        action: function (info: ExtensionApiOptions) {
            // const vinylBabelrc = findByName(info.configFiles, name)
            // if (!vinylBabelrc) {
            //     metaBabelCompiler.logger && metaBabelCompiler.logger.error('could not find ', name)
            //     throw new Error('could not find ' + name)
            // }
            // const rawBabelrc = vinylBabelrc!.contents!.toString()
            // const babelrc = JSON.parse(rawBabelrc)
            const babelrcFromfind = babelFindConfiguration(info, name)
            const babelrc = _get(babelrcFromfind, 'config.babel', babelrcFromfind.config)

            const componentDir = info.context && info.context.componentDir

            if (componentDir) {
                babelrc.plugins = _get(babelrc, 'plugins', []).map((pluginName: string |Array<string>) => {
                    const actualPluginName = Array.isArray(pluginName) ? pluginName[0]: pluginName
                    return resolvePlugin(componentDir, actualPluginName)
                })
                babelrc.presets = _get(babelrc,'presets', []).map((presetName: string) => resolvePreset(componentDir, presetName))
            }
            const builtFiles: {files:Array<Vinyl>, errors:Array<any>} = (info.files || [])
                .map((file:Vinyl) => runBabel(file, babelrc, info.context.rootDistDir))
                .reduce((a:any, b:any):any => {
                    return {
                        errors: a.errors.concat(b.errors),
                        files: a.files.concat(b.files)
                    }
                })
            return !builtFiles.errors.length ? Promise.resolve(builtFiles): Promise.reject(builtFiles.errors)
        },
        getDynamicPackageDependencies: function (info){
            return getBabelDynamicPackageDependencies(metaBabelCompiler.logger!, name)(info)
        }
    }
    return metaBabelCompiler
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

function runBabel(file:Vinyl, options:object, distPath:string) {
    const adjustedOptions = Object.assign({}, options, {
        filename:file.relative
    })
    let r
    try {
        r = babel.transform(file.contents!.toString(), adjustedOptions)
    } catch(e){
        return {files:[], errors:[e]}
    }
    if (r.ignored) {
        return {files:[], errors:[]}
    }
    const mappings = new Vinyl({
        contents: Buffer.from(_get(r, 'map.mappings', '')),
        base: distPath,
        path: path.join(distPath, file.relative),
        basename: `${file.basename}.map`
    })
    const distFile = file.clone()
    distFile.base = distPath
    distFile.path = path.join(distPath, file.relative)
    distFile.contents = r.code ? Buffer.from(`${r.code}\n\n//# sourceMappingURL=${mappings.basename}`) : Buffer.from(r.code!)
    return {files:[mappings, distFile], errors: []}
}

export default CreateBabelCompiler()
