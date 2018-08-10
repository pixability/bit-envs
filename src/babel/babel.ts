/// <reference path='./babel-core.d.ts' />
import { CompilerExtension, API, ExtensionApiOptions } from '../env-utils/types'
import Vinyl from 'vinyl'
import {
    findByName,
    getBabelDynamicPackageDependencies,
    getPluginPackageName,
    getPresetPackageName
} from '../env-utils'
import resolve from 'resolve'
import path from 'path'
import * as babel from 'babel-core'
import _get from 'lodash.get'

export function CreateBabelCompiler(name='.babelrc') {
    const metaBabelCompiler: CompilerExtension = {
        init: function ({ api }: { api: API }) {
            metaBabelCompiler.logger = api.getLogger()
            return {
                write: false
            }
        },
        action: function (info: ExtensionApiOptions) {

            const vinylBabelrc = findByName(info.configFiles, name)
            if (!vinylBabelrc) {
                metaBabelCompiler.logger && metaBabelCompiler.logger.error('could not find ', name)
                throw new Error('could not find ' + name)
            }
            const rawBabelrc = vinylBabelrc!.contents!.toString()
            const babelrc = JSON.parse(rawBabelrc)
            const componentDir = info.context && info.context.componentDir

            if (componentDir) {
                babelrc.plugins = _get(babelrc, 'plugins', []).map((pluginName: string |Array<string>) => {
                    const actualPluginName = Array.isArray(pluginName) ? pluginName[0]: pluginName
                    return resolvePlugin(componentDir, actualPluginName)
                })
                babelrc.presets = _get(babelrc,'presets', []).map((presetName: string) => resolvePreset(componentDir, presetName))
            }

            try {
                const builtFiles: Array<Vinyl> = (info.files || []).map((file:Vinyl) => runBabel(file, babelrc, info.context.rootDistFolder))
                    .reduce((a:any, b:any) => a.concat(b))
                return Promise.resolve({ files: builtFiles })
            } catch (e) {
                throw e
            }
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
    const adjustedOptions = Object.assign({}, options, { filename:file.basename})
    const r = babel.transform(file.contents!.toString(), adjustedOptions)
    if(r.ignored) {
        return []
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
    return [mappings, distFile]
}

export default CreateBabelCompiler()
