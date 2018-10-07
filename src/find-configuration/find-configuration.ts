
import { loadPackageJsonSync, findByName, ExtensionApiOptions } from '../env-utils';
import _ from 'lodash'
import path from 'path'
import fs from 'fs-extra'

export const enum FindStrategy {
    fileName = 'fileName',
    raw = 'raw',
    pjKeyName = 'pjKeyName',
    default = 'default',
    defaultFilePaths = 'defaultFilePaths',
    dynamicConfig = 'dynamicConfig'
}

export type findOptions = {
    [FindStrategy.pjKeyName]:string,
    [FindStrategy.fileName]:string,
    [FindStrategy.default]?: any,
    [FindStrategy.defaultFilePaths]?: Array<string>,
    strategy?: Array<FindStrategy>
}

export const defaultGetBy:{[k:string]:any} = {
    [FindStrategy.dynamicConfig]: function (info:ExtensionApiOptions, _options:findOptions) {
        const config = {config:null, save:false}
        if (info.dynamicConfig && !_.isEqual(info.dynamicConfig, {}) && !_.isEqual(info.dynamicConfig, info.rawConfig)) {
            config.config = (info.dynamicConfig as any)
        }
        return config
    },
    [FindStrategy.defaultFilePaths]: function (info:ExtensionApiOptions, options:findOptions) {
        const config = { config: null, save: false}
        const paths:Array<string> = options.defaultFilePaths || []
        for (const configPath of paths) {
            const correctFolder =  _.get(info, 'context.componentDir', '') || _.get(info, 'context.componentDir', '')
            const fullConfigPath = path.resolve(correctFolder, configPath)
            if(fs.existsSync(fullConfigPath)){
                config.config = readConfigByFileEnding(fullConfigPath)
                config.save = !!config.config
                if (config.save){
                    throw new Error(`Default configuration path found: configure ${fullConfigPath} in bit.json compiler/tester files entry.`)
                }
            }
        }
        return config
    },
    [FindStrategy.fileName]: function (info:ExtensionApiOptions, options:findOptions) {
        const config = { config: null, save: false}
        if (!info.configFiles){
            return config
        }
        try {
            const configVinyl = findByName(info.configFiles, options.fileName)
            if (configVinyl) {
                config.config = readConfigByFileEnding(configVinyl.path, configVinyl.contents!.toString())
            }

        } catch(e) {}
        return config
    },
    [FindStrategy.default]: function (_info:ExtensionApiOptions, options:findOptions) {
        return {
            config: options.default ? options.default : null,
            save: false
        }

    },
    [FindStrategy.raw]: function(info:ExtensionApiOptions, options:findOptions) {
        return {
            config: Object.keys(_.get(info, `rawConfig.${options.pjKeyName}`, {})).length > 0 ?
                _.get(info, `rawConfig.${options.pjKeyName}`, {}) :
                null,
            save: false
        }
    },
    [FindStrategy.pjKeyName]: function(info:ExtensionApiOptions, options:findOptions){
        const workspaceDir = info.context && info.context.workspaceDir
        const componentDir = info.context && info.context.componentDir
        let packageJson:{[k:string]:any} = {}
        try {
            packageJson = loadPackageJsonSync(componentDir, workspaceDir)
        } catch(e){}
        debugger
        return {
            config: packageJson && packageJson[options.pjKeyName] ? {[options.pjKeyName]:packageJson[options.pjKeyName]} : null,
            save: !!(packageJson && packageJson[options.pjKeyName])
        }
    }
}

export function findConfiguration(info:ExtensionApiOptions, options:findOptions, getBy = defaultGetBy){
    const defaultStrategy =  [
        FindStrategy.dynamicConfig,
        FindStrategy.fileName,
        // FindStrategy.defaultFilePaths,
        FindStrategy.raw,
        FindStrategy.pjKeyName,
        FindStrategy.default
    ]
    const strategy:Array<FindStrategy> =  options.strategy || defaultStrategy
    const config:{config:any, save:boolean} = {config: {}, save: false}
    for (let method of strategy) {

        const configLookup = !!getBy[method] ? getBy[method](info, options): (console.log('unknown strategy to load configuration'), null)
        if (configLookup.config) {
            Object.assign(config.config, configLookup.config)
            config.save = configLookup.save
            break
        }
    }
    config.config = {...config.config, ...(getBy.raw(info, options).config || {})}
    return config
}

function readConfigByFileEnding(configPath:string, content = '' ){
    return configPath.endsWith('.js') ?
        require(configPath) :
        content ?
        JSON.parse(content) :
        fs.readJsonSync(configPath)
}
