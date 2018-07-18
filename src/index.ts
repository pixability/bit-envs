import fs from 'fs-extra'
import path, {sep} from 'path'
import webpack from 'webpack'
import MemoryFS from 'memory-fs'
import Vinyl from 'vinyl'

export interface API {
    getLogger: () => any
}
export interface Options {
    write: boolean
}
// spilt interfaces
export interface ExtensionApiOptions {
    files?: any
    rawConfig?: any
    dynamicConfig?: any
    configFiles: [any]
    api?: any
    context: any
}

export interface CompilerExtension {
    init: ({ api }: { api: API }) => Options
    action: (info: ExtensionApiOptions) => Promise<Vinyl>
    getDynamicPackageDependencies: (info: ExtensionApiOptions) => object
    logger?: any
}

export function CreateWebpackCompiler() {
    const MetaWebpack: CompilerExtension = {
        init: ({ api }: { api: any }) => {
            MetaWebpack.logger = api.getLogger()
            return { write: true }
        },
        action: function (info: ExtensionApiOptions) {
            const configuration = require(findConfigFile(info.configFiles).path)
            if (typeof configuration.entry === 'object' && Object.keys(configuration.entry).length > 1){
                const entires = Object.keys(configuration.entry)
                let correctEntry = {}
                for (let i=0; i<entires.length; ++i) {
                    // can entry be glob or filename without ending
                    if (configuration.entry[entires[i]].endsWith(info.context.componentObject.mainFile)){
                        correctEntry = {[entires[i]]:configuration.entry[entires[i]]}
                        break;
                    }
                }
                if (!Object.keys(correctEntry).length) {
                    MetaWebpack.logger.log('Couldnt find entry')
                    throw new Error('Couldnt find entry')
                }
                configuration.entry = correctEntry
            }
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
            .then(function(bundles:any) {
                const bundleName  = Object.keys(bundles)[0]
                return new Vinyl({
                    path: bundles[bundleName].existsAt,
                    contents: Buffer.from(bundles[bundleName]._value)
                })

            })
        },
        getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
            const packages: { [key: string]: string } = {}
            const config: any = require(findConfigFile(info.configFiles).path)
            const packageJson = loadPackageJsonSync(info.context.componentDir, info.context.workspaceDir)
            if (!packageJson) {
                return packages
            }
            ((config && config.module && config.module.rules) || []).forEach(function (rule: { use?: string, loader?: string }) {
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

function fillDependencyVersion(packageJson: any, name: string, toFill: any) {
    // check dependencies priority
    const version = packageJson.devDependencies[name] || packageJson.dependencies[name] || packageJson.peerDependencies[name]
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

function findConfigFile(configs:Array<any>){
    const file = configs.find((config:any) => {
        const splitPath = config.path.split(sep)
        return splitPath[splitPath.length -1] === 'webpack.config.js'
    })
    if (!file){
        throw new Error('Could not find webpack.config.js')
    }
    return file
}
export default CreateWebpackCompiler()
// assign entires with the one with the main file of component
// resolve dependencies from loaders - done
// init function will return configuration object {write:true} - done
// actual bundling should output with in memory fs - done
// use can be string or array, loader can only be string - done

