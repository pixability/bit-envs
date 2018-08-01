import { TesterExtension, ExtensionApiOptions, API, ActionTesterOptions } from '../types'
import { loadPackageJsonSync, fillDependencyVersion } from '../compiler-utils'
import { JSONReporter } from './json-reporter'
import Mocha, {Test} from 'mocha'
import _get from 'lodash.get'
import fs from 'fs-extra'
import path from 'path'

export function CreateMochaTester(): TesterExtension {
    const metaMocha: TesterExtension = {
        init: function ({ api }: { api: API }) {
            metaMocha.logger = api.getLogger()
            return {
                write:false
            }
        },
        action: function (info: ActionTesterOptions) {
            const correctFolder = info.context.componentDir || info.context.workspaceDir
            const privateRequire = createPrivateRequire(correctFolder)
            _get(info, 'context.componentObject.dynamicConfig.require', []).forEach(function(toRequire:string){
                privateRequire(toRequire)
            })
            _get(info, 'context.componentObject.dynamicConfig.filesRequire', []).forEach(function(toRequire:string){
                require(path.resolve(correctFolder, toRequire))
            })
            cleanPrivateRequire(correctFolder)
            try {
                return new Promise((resolve) => {
                    const mocha = new Mocha({ reporter: (JSONReporter as any) })

                    info.testFiles.forEach((testFile) => {
                        mocha.addFile(testFile.path)
                    })
                    mocha.run()
                    .on('end', function (this: { testResults: any }) {
                        const results = this.testResults
                        const rawResults = ([]).concat.apply([], Object.keys(results).map(function (item) {
                            return results[item].map(function (describerResult:any) {
                                return normalizeResults(describerResult, item)
                            })

                        }) )
                        resolve(rawResults)
                    })
                })
            } catch (e) {
                throw e
            }
        },
        getDynamicPackageDependencies: function (info: ExtensionApiOptions) {
            let packages = {}
            const packageJson = loadPackageJsonSync(info.context.componentDir, info.context.workspaceDir)
            if (!packageJson) {
                metaMocha.logger.log('Could not find package.json.')
                return packages
            }
            _get(info, 'dynamicConfig.require', []).forEach(function (mochaRequire: string) {
                const requireParts = mochaRequire.split('/')
                fillDependencyVersion(packageJson, requireParts[0], packages)
            })
            return packages
        }
    }
    return metaMocha
}

const isEmptyObject = (obj: object) => Object.keys(obj).length === 0


function normalizeResults(mochaJsonResults: any, file: string) {
    function normalizeError(err: Error) {
        return {
            message: err.message,
            stack: err.stack
        }
    }

    function normalizeStats(stats: { start: number, end: number }) {
        return {
            start: stats.start,
            end: stats.end
        }
    }

    function normalizeTest(test: Test) {
        const isError = test.err && !isEmptyObject(test.err)
        return ({
            title: test.fullTitle,
            pass: !isError,
            err: isError && test.err ? normalizeError(test.err) : null,
            duration: test.duration
        })
    }

    function normalizeFailure(failure: Test) {
        const isError = failure.err && !isEmptyObject(failure.err)
        return ({
            title: failure.fullTitle,
            err: failure.err && isError ? normalizeError(failure.err) : null,
            duration: failure.duration
        })
    }

    return {
        tests: mochaJsonResults.tests.map(normalizeTest),
        stats: normalizeStats(mochaJsonResults.stats),
        failures: mochaJsonResults.failures.map(normalizeFailure),
        pass: mochaJsonResults.failures.length === 0,
        specPath: file
    }
}

const IGNORE_FOLDER = '.bitTmp'

function createPrivateRequire(directory:string) {
    const privateRequireContent = `
    function privateRequire(pathToModule){
        return require(pathToModule)
    }
    module.exports = privateRequire
    `
    const tempFolderInComp = path.resolve(directory, IGNORE_FOLDER)
    if(!fs.existsSync(tempFolderInComp)) {
        fs.mkdirpSync(tempFolderInComp)
    }
    const pathToDynamicScript = path.resolve(tempFolderInComp, 'private-require.js')
    fs.writeFileSync(pathToDynamicScript, privateRequireContent, { encoding:'utf8' })

    return require(pathToDynamicScript)

}

function cleanPrivateRequire(directory:string) {
    const pathToDynamicScript = path.resolve(directory, IGNORE_FOLDER, 'private-require.js')
    fs.unlinkSync(pathToDynamicScript)

}
export default CreateMochaTester()
