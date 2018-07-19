import fs from 'fs-extra'
import path from 'path'
import webpack from 'webpack'
import MemoryFS from 'memory-fs'
import Vinyl from 'vinyl'
import _get from 'lodash.get'

export interface API {
    getLogger: () => {
        log:Function
    }
}
export interface Options {
    write: boolean
}
// spilt interfaces
export interface ExtensionApiOptions {
    files?: any
    rawConfig?: any
    dynamicConfig?: any
    configFiles: [Vinyl]
    api?: any
    context: any
}

export interface CompilerExtension {
    init: ({ api }: { api: API }) => Options
    action: (info: ExtensionApiOptions) => Promise<{files: Array<Vinyl>}>
    getDynamicPackageDependencies: (info: ExtensionApiOptions) => object
    logger?: any
}

export function CreateWebpackCompiler(mainConfigName = 'webpack.config.js') {
    const MetaWebpack: CompilerExtension = {
        init: ({ api }:{api:API}) => {
            MetaWebpack.logger = api.getLogger()
            return { write: true }
        },
        action: function (info: ExtensionApiOptions) {
            debugger
            const configuration = require(findConfigFile(info.configFiles, mainConfigName).path)
            adjustConfigurationIfNeeded(configuration, info.context.componentObject.mainFile, MetaWebpack.logger)
            const compiler = webpack(configuration)
            const fs = new MemoryFS()
            compiler.outputFileSystem = (fs as any)
            return (new Promise(function (resolve, reject) {
                return compiler.run(function (err, stats) {
                    const compilation = (stats as any).compilation
                    if (err || compilation.errors.length > 0) {
                        MetaWebpack.logger.log(err || compilation.errors)
                        reject(err || compilation.errors)
                        return
                    }
                    resolve(compilation.assets)
                })
            }))
            .then(function(assets:any) {
                return {
                    files:Object.keys(assets).map((name)=>{
                        return new Vinyl({
                            base: info.context.rootDistFolder,
                            baseName: name,
                            path: assets[name].existsAt,
                            contents: Buffer.from(assets[name]._value)
                        })
                    })
                }
            })
        },
        getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
            const packages: { [key: string]: string } = {}
            const config: any = require(findConfigFile(info.configFiles, mainConfigName).path)
            const packageJson = loadPackageJsonSync(info.context.componentDir, info.context.workspaceDir)
            if (!packageJson) {
                MetaWebpack.logger.log('Could not find package.json.')
                return packages
            }

            _get(config, 'module.rules', []).forEach(function (rule: { use?: string, loader?: string }) {
                if (Array.isArray(rule.use)) {
                    rule.use.forEach(function (internalUse) {
                        fillDependencyVersion(packageJson, internalUse.loader, packages)
                    })
                }

                if (rule.use && typeof rule.use === 'string') {
                    fillDependencyVersion(packageJson, rule.use, packages)
                }

                if (rule.loader && typeof rule.loader === 'string') {
                    fillDependencyVersion(packageJson, rule.loader, packages)
                }
            })
            return packages
        }
    }
    return MetaWebpack
}

function fillDependencyVersion(packageJson: any, name: string, toFill: {[k:string]:string}) {
    const version = _get(packageJson, `dependencies[${name}]`)    ||
                    _get(packageJson, `devDependencies[${name}]`) ||
                    _get(packageJson, `peerDependencies[${name}]`)
    if (version) {
        toFill[name] = version
    }
}

function loadPackageJsonSync(componentDir: string, workspaceDir: string) {
    const packageJsonName = 'package.json'
    let packageJsonPath
    if (componentDir) {
        packageJsonPath = path.join(componentDir, packageJsonName)
        const packageJson = loadPackageJsonFromPathSync(packageJsonPath)
        if (packageJson) {
            return packageJson
        }
    }
    packageJsonPath = path.join(workspaceDir, packageJsonName)
    return loadPackageJsonFromPathSync(packageJsonPath)
}

function loadPackageJsonFromPathSync(packageJsonPath: string) {
    return fs.pathExistsSync(packageJsonPath) ? fs.readJsonSync(packageJsonPath) : undefined
}

function findConfigFile(configs:Array<any> , configName:string){
    const file = configs.find((config:any) => {
        const splitPath = config.path.split(path.sep)
        return splitPath[splitPath.length -1] === configName
    })
    if (!file){
        throw new Error(`Could not find ${configName}`)
    }
    return file
}

function adjustConfigurationIfNeeded(configuration:any, mainFile:string, logger:{log:Function}){
    if (typeof configuration.entry === 'object' && Object.keys(configuration.entry).length > 1){
        const entires = Object.keys(configuration.entry)
        let correctEntry = {}
        for (let i=0; i<entires.length; ++i) {
             const entryNamNoEnding = mainFile.split('.').slice(0, -1).join('.')
            if (configuration.entry[entires[i]].endsWith(mainFile) ||
                 configuration.entry[entires[i]].endsWith(entryNamNoEnding)){
                correctEntry = {[entires[i]]:configuration.entry[entires[i]]}
                break;
            }
        }
        if (!Object.keys(correctEntry).length) {
            logger.log('Could not find entry')
            throw new Error('Could not find entry')
        }
        configuration.entry = correctEntry
    }
}
export default CreateWebpackCompiler()
