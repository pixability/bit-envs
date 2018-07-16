import fs from 'fs-extra'
import path from 'path'
export interface API {
    getLogger: ()=> any
}
export interface Options {
    write:boolean
}

export interface ExtensionApiOptions {
    files?:any
    rawConfig?:any
    dynamicConfig?:any
    configFiles:[any]
    api?:any
    context:any
}

export interface CompilerExtension {
    init: ({api}:{api:API}) => Options
    action: ()=> string
    getDynamicPackageDependencies: (info:ExtensionApiOptions)=>object
    logger?:any
}

export function CreateWebpackCompiler() {
    const MetaWebpack:CompilerExtension = {
        init: ({ api }:{ api:any }) => {
            MetaWebpack.logger = api.getLogger()
            return { write:true }
        },
        action: function() {
            return ''
        },
        getDynamicPackageDependencies: function(info:ExtensionApiOptions) {
            const packages:{[key:string]:string} = {}
            const config:any = require(info.configFiles[0].path)
            const packageJson = loadPackageJsonSync(info.context.componentDir, info.context.workspaceDir)
            if (!packageJson) {
                return packages
            }
            ((config && config.module && config.module.rules) || []).forEach(function(rule:{use?:string, loader?:string}) {
                if (Array.isArray(rule.use)) {
                    rule.use.forEach( function(internalUse) {
                        fillDependencyVersion(packageJson, internalUse.loader, packages)
                    })
                }
                if(!!rule.use && typeof rule.use === 'string') {
                    fillDependencyVersion(packageJson, rule.use, packages)
                }

                if (!!rule.loader && typeof rule.loader === 'string') {
                    fillDependencyVersion(packageJson, rule.loader, packages)
                }
            })
            return packages
        }
    }
    return MetaWebpack
}

function fillDependencyVersion(packageJson:any, name:string, toFill:any) {
    const version = packageJson.devDependencies[name] || packageJson.dependencies[name] || packageJson.peerDependencies[name]
    if (version) {
        toFill[name] = version
    }
}

function loadPackageJsonSync(componentDir:string, workspaceDir:string) {
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

function loadPackageJsonFromPathSync(packageJsonPath:string) {
    return fs.pathExistsSync(packageJsonPath) ? fs.readJsonSync(packageJsonPath) : undefined
}

export default CreateWebpackCompiler()
