import {TesterExtension, API, ActionTesterOptions, ExtensionApiOptions, Logger} from '../types'
import {loadPackageJsonSync, findByName, fillDependencyVersion} from '../compiler-utils'
import _get from 'lodash.get'
import {runCLI} from 'jest-cli'
import {convertJestFormatToBitFormat} from './result-adapter'
import path from 'path'
import fs from 'fs-extra'

export default CreateJestTester()

export function CreateJestTester(): TesterExtension {
    const metaJest: TesterExtension = {
        init: function ({ api }: { api: API }) {
            metaJest.logger = api.getLogger()
            return {
                write:true
            }
        },
        action: function (info: ActionTesterOptions) {
            const config = findByName(info.configFiles, 'jest.config.js')
            const directory = getDirectory(info, metaJest.logger)
            const stdStreamHandler = CreateSTDStreamHandler(metaJest.logger)
            const resultHandler = CreateResultFileHandler(directory)

            stdStreamHandler.shutdown()
            const outputFile = resultHandler.preTest()
            return runCLI({
                rootDir: directory,
                config: config.path,
                json: true,
                outputFile
            },[directory])
                .then(function (){
                    const results = resultHandler.getResults()
                    const normalizedResults = convertJestFormatToBitFormat(results)
                    resultHandler.postTest()
                    stdStreamHandler.restore()
                    return normalizedResults
                })

                // should add bluebird
                // .finally(function(){
                //     // stdStreamHandler.restore()
                //     resultHandler.postTest()
                // })

        },
        getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
            let packages = {}
            const packageJson = loadPackageJsonSync(info.context.componentDir, info.context.workspaceDir)
            if (!packageJson) {
                metaJest.logger.log('Could not find package.json.')
                return packages
            }
            const config = require(findByName(info.configFiles, 'jest.config.js').path)
            const paths = ['transform', 'preset', 'prettierPath', 'moduleNameMapper', 'snapshotSerializers']
            jestFindDynamicDependencies(config, paths, packageJson, packages)
            return packages
        }
    }
    return metaJest
}
function parseAndFillDependencyVersion(packageJson:object, value:string, toFill: {[k:string]:string}){
    if(!!~value.indexOf('node_modules')) {
        const valueParts = value.split('/')
        const packageIndex = valueParts.indexOf('node_modules')
        if (packageIndex !== valueParts.length -1){
            fillDependencyVersion(packageJson, valueParts[packageIndex + 1], toFill)
        }
        return

    }
    fillDependencyVersion(packageJson, value, toFill)
}

function jestFindDynamicDependencies(
    config:any,
    paths:Array<string>,
    packageJson:object,
    toFill: {[k:string]:string}){
    paths.forEach(function(path:string){
        const value = _get(config, path)
        if (!value){
            return
        }
        if (typeof value === 'string'){
            parseAndFillDependencyVersion(packageJson, value, toFill)
        } else if (value instanceof Array){
            value.forEach(function(item:string){
                parseAndFillDependencyVersion(packageJson, item, toFill)
            })
        } else if (typeof value === 'object') {
            Object.keys(value).forEach(function(key){
                const internalValue = value[key]
                parseAndFillDependencyVersion(packageJson, internalValue, toFill)
            })
        }
    })
}

function CreateSTDStreamHandler(logger:Logger) {
    const savedSTDWrite = process.stdout.write
    const savedERRWrite = process.stderr.write
    let stdContent = ''
    let stderr = ''
    return {
        shutdown: function() {
            //@ts-ignore
            process.stdout.write = function (str: string, encoding?: string, cb:Function) {
                stdContent += str.toString()
                return true
            }
            //@ts-ignore
            process.stderr.write = function write(str: string, encoding?: string, cb:Function) {
                stderr += str.toString()
                return true
            }
        },
        restore: function() {
            logger.error(stderr)
            logger.log(stdContent)
            process.stdout.write = savedSTDWrite
            process.stderr.write = savedERRWrite

        }
    }
}
function CreateResultFileHandler(directory:string) {
    const resultFileName = 'jestResults.json'
    let outputFile = ''
    let bitTmpPath = ''
    return {
        preTest: function() {
            bitTmpPath = path.resolve(directory, '.bitTmp')
            outputFile = path.resolve(directory, '.bitTmp', resultFileName)
            !fs.existsSync(bitTmpPath) && fs.mkdirpSync(bitTmpPath)
            return outputFile
        },
        postTest: function() {
            fs.existsSync(outputFile) && fs.unlinkSync(outputFile)
            fs.emptyDir(bitTmpPath) && fs.removeSync(bitTmpPath)
        },
        getResults: function() {
            let result = null
            if (!fs.existsSync(outputFile)){
                throw new Error('can not find ' + resultFileName)
            }
            try {
                result = JSON.parse(fs.readFileSync(outputFile).toString())
            } catch(e) {
                throw new Error('result not a valid json')
            }
            return result
        }
    }
}

function getDirectory(info: ActionTesterOptions, logger:Logger) {
    const directory = _get(info, 'context.workspaceDir') ||
                      _get(info, 'context.componentDir') ||
                      _get(info, 'context.testFiles[0].path')
    if(!directory){
        logger.error('Could not find test directory')
        throw new Error('Could not find test directory')
    }
    return directory
}
