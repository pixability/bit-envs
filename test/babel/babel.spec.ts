import { expect } from 'chai'
import { CreateBabelCompiler } from '../../src'
import { createApi, createConfigFile, createFiles, setup } from '../envs-test-utils'
import { getVersion } from '../../src/env-utils'
import path from 'path'
import Vinyl from 'vinyl'
import _eval from 'eval'

const baseFixturePath = path.resolve(__dirname, './fixture')
const ignoreList = ['.babelrc', 'package.json', 'package-lock.json','.babelrc.only', '.babelrc.ignore']

describe('babel', function () {
    before(function() {
        setup(this, [baseFixturePath])
    })
    it('init', function () {
        const compiler = CreateBabelCompiler()
        const options = compiler.init({
            api: createApi()
        })
        expect(!!compiler.logger).to.be.true
        expect(options.write).to.be.false
    })

    it('getDynamicPackageDependencies', function () {
        const config = createConfigFile(baseFixturePath, '.babelrc')
        const context = {
            componentDir: baseFixturePath
        }
        const packageJSON = require(path.resolve(baseFixturePath, './package.json'))
        const compiler = CreateBabelCompiler()
        compiler.init({
            api: createApi()
        })
        let results = compiler.getDynamicPackageDependencies({ configFiles: [config], context })
        const presetEnv = 'babel-preset-env'
        const restPlugin = 'babel-plugin-transform-object-rest-spread'
        const asyncPlugin = 'babel-plugin-transform-async-to-module-method'
        expect(results).to.contain({
            [presetEnv]: getVersion(packageJSON, presetEnv),
            [restPlugin]: getVersion(packageJSON, restPlugin),
            [asyncPlugin]: getVersion(packageJSON, asyncPlugin)
        })
    })

    it('action', function () {
        return runCompilerAction('.babelrc')
            .then(function(assets){
                const toRun = assets.files.find((file:Vinyl)=> file.basename == 'b.js')
                const toRunRaw = _eval(toRun!.contents!.toString())
                expect(toRunRaw.run()).to.equal(0)
            })
    })
    it('action should support only', function () {
        return runCompilerAction('.babelrc.only')
            .then(function(assets){
                expect(assets.files.length).to.equal(0)
            })
    })
    it('action should support ignore', function () {
        return runCompilerAction('.babelrc.ignore')
            .then(function(assets){
                expect(assets.files.length).to.equal(2)
            })
    })
})

function runCompilerAction(configName:string) {
    const compiler = CreateBabelCompiler(configName)
    const files = createFiles(baseFixturePath, ignoreList)
    const config = createConfigFile(baseFixturePath, configName)
    const actionInfo = {
        files,
        configFiles: [config],
        context: {
            componentDir: baseFixturePath,
            componentObject: {
                mainFile: ''
            },
            rootDistFolder: path.resolve(baseFixturePath, './dist')
        }
    }
    compiler.init({ api: createApi() })
    return compiler.action(actionInfo)
}
