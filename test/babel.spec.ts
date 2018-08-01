import { expect } from 'chai'
import { CreateBabelCompiler } from '../src'
import { createApi, createConfigFile, createFiles } from './envs-test-utils'
import { getVersion } from '../src/compiler-utils'
import path from 'path'
import Vinyl from 'vinyl'
import _eval from 'eval'

const baseFixturePath = path.resolve(__dirname, './fixtures/babel')

describe('babel', function () {
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
        const compiler = CreateBabelCompiler()
        const files = createFiles(baseFixturePath, ['.babelrc', 'package.json', 'package-lock.json'])
        const config = createConfigFile(baseFixturePath, '.babelrc')
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
            .then(function(assets){
                const toRun = assets.files.find((file:Vinyl)=> file.basename == 'b.js')
                const toRunRaw = _eval(toRun!.contents!.toString())
                expect(toRunRaw.run()).to.equal(0)
            })
    })
})

