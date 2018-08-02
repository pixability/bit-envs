import webpack from 'webpack'
import MemoryFS from 'memory-fs'
import Vinyl from 'vinyl'
import _get from 'lodash.get'
import {CompilerExtension, ExtensionApiOptions, API ,Logger} from '../env-utils/types'
import {loadPackageJsonSync, fillDependencyVersion, findByName, getBabelDynamicPackageDependencies} from '../env-utils'

export function CreateWebpackCompiler(mainConfigName = 'webpack.config.js'):CompilerExtension {
    const metaWebpack: CompilerExtension = {
        init: function({ api }:{api:API}) {
            metaWebpack.logger = api.getLogger()
            return { write: true }
        },
        action: function(info: ExtensionApiOptions) {
            const configuration = require(findByName(info.configFiles, mainConfigName).path)
            adjustConfigurationIfNeeded(configuration, info.context.componentObject.mainFile, metaWebpack.logger!)
            const compiler = webpack(configuration)
            const fs = new MemoryFS()
            compiler.outputFileSystem = (fs as any)
            return (new Promise(function (resolve, reject) {
                return compiler.run(function (err, stats) {
                    const compilation = (stats as any).compilation
                    if (err || compilation.errors.length > 0) {
                        metaWebpack.logger!.log(err || compilation.errors)
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
        getDynamicPackageDependencies: function(info: ExtensionApiOptions, babelConfigName = '.babelrc') {
            const packages: { [key: string]: string } = {}
            const configFile = findByName(info.configFiles, mainConfigName)
            debugger
            const config = require(configFile.path)
            const packageJson = loadPackageJsonSync(info.context.componentDir, info.context.workspaceDir)

            if (!packageJson) {
                metaWebpack.logger!.log('Could not find package.json.')
                return packages
            }

            function handleLoader(packageJson: object, name: string, toFill: {[k:string]:string}){
                let babelResults = {}
                if(name === 'babel-loader'){
                    babelResults = getBabelDynamicPackageDependencies(metaWebpack.logger!, babelConfigName)(info)
                }

                fillDependencyVersion(packageJson, name, toFill)
                Object.assign(toFill, babelResults)
            }
            debugger
            _get(config, 'module.rules', []).forEach(function (rule: { use?: string, loader?: string }) {
                if (Array.isArray(rule.use)) {
                    rule.use.forEach(function (internalUse) {
                        handleLoader(packageJson, internalUse.loader, packages)
                    })
                }

                if (rule.use && typeof rule.use === 'string') {
                    handleLoader(packageJson, rule.use, packages)
                }

                if (rule.loader && typeof rule.loader === 'string') {
                    handleLoader(packageJson, rule.loader, packages)
                }
            })
            return packages
        }
    }
    return metaWebpack
}



function adjustConfigurationIfNeeded(configuration:any, mainFile:string, logger:Logger){
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
            logger.error('Could not find entry')
            throw new Error('Could not find entry')
        }
        configuration.entry = correctEntry
    }
}

export default CreateWebpackCompiler()
