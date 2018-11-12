import { CompilerExtension, API, ExtensionApiOptions } from '../env-utils/types'
import Vinyl from 'vinyl'
import {
  babelFindConfiguration,
  getBabelPackageDependencies,
  findBabelNameInDeps,
  findBabelPluginNames
} from '../babel-dependencies'
import resolve from 'resolve'
import path from 'path'
import * as babel from '@babel/core'
import _get from 'lodash.get'
import minimatch from 'minimatch'

export function CreateBabelCompiler (name = '.babelrc') {
  const metaBabelCompiler: CompilerExtension = {
    init: function ({ api }: { api: API }) {
      metaBabelCompiler.logger = api.getLogger()
      return {
        write: true
      }
    },
    getDynamicConfig: function (info: ExtensionApiOptions) {
      const config = babelFindConfiguration(info, name)
      return config.save ? config.config : info.rawConfig
    },
    action: function (info: ExtensionApiOptions) {
      const babelrcFromFind = babelFindConfiguration(info, name)
      const babelrc = _get(
        babelrcFromFind,
        'config.babel',
        babelrcFromFind.config
      )
      const componentDir = info.context && info.context.componentDir
      const patternsNotToCompile = _get(info, 'rawConfig.skipCompile', [])
      if (componentDir) {
        const dependencies = getBabelPackageDependencies(name, info)
        const findBabelAddonLocations = (
          babelType: 'plugin' | 'preset',
          addons: Array<string>
        ) => {
          return addons
          .map(
            (name: any) => findBabelNameInDeps(name, babelType, dependencies)
          )
          .map((packageName: any) => resolvePackagesFromComponentDir(
            componentDir,
            packageName
          ))
        }
        // here we map the plugins and presets to their absolute locations
        // rather than letting babel control their resolution because then they
        // might resolve differently in an author/consumer environment
        babelrc.plugins = findBabelAddonLocations(
          'plugin',
          findBabelPluginNames(babelrc.plugins)
        )
        babelrc.presets = findBabelAddonLocations(
          'preset',
          _get(babelrc, 'presets', [])
        )
      }
      const builtFiles: { files: Array<Vinyl>; errors: Array<any> } = (
        info.files || []
      )
        .map((file: Vinyl) => {
          return patternsNotToCompile.some((glob: string) => {
            return minimatch(file.path, glob)
          })
            ? { errors: [], files: [file] }
            : runBabel(file, babelrc, info.context.rootDistDir)
        })
        .reduce((a: any, b: any): any => {
          return {
            errors: a.errors.concat(b.errors),
            files: a.files.concat(b.files)
          }
        })
      return !builtFiles.errors.length
        ? Promise.resolve(builtFiles)
        : Promise.reject(builtFiles.errors)
    },
    getDynamicPackageDependencies: function (info) {
      return getBabelPackageDependencies(name, info)
    }
  }
  return metaBabelCompiler
}

function resolvePackagesFromComponentDir (
  componentDir: string,
  packagName: string
) {
  // This might be done using the paths option in node's
  // built in require.resolve function
  // but this option is only supported since node v8.9.0
  // so in order to support older versions
  // we used this package
  const resolvedPackage = resolve.sync(packagName, { basedir: componentDir })
  return resolvedPackage
}

function runBabel (file: Vinyl, options: object, distPath: string) {
  const ignore = _get(options, 'ignore', undefined)
  const adjustedOptions = Object.assign({}, options, {
    filename: file.relative,
    ignore: ignore
      ? ignore.map((pattern: string) => {
        return path.join(path.dirname(file.relative), pattern)
      })
      : ignore
  })
  let r
  try {
    r = babel.transform(file.contents!.toString(), adjustedOptions)
    if (!r) return { files: [], errors: [] }
  } catch (e) {
    return { files: [], errors: [e] }
  }
  if (r.ignored) {
    return { files: [], errors: [] }
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
  distFile.contents = r.code
    ? Buffer.from(`${r.code}\n\n//# sourceMappingURL=${mappings.basename}`)
    : Buffer.from(r.code)
  return { files: [mappings, distFile], errors: [] }
}

export default CreateBabelCompiler()
