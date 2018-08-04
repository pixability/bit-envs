import {expect} from 'chai'
import {CreateWebpackCompiler} from '../../src'
import {CompilerExtension, ExtensionApiOptions} from '../../src/env-utils'
import {createApi, createConfigFile, createFiles, setup} from '../envs-test-utils'
import {getVersion} from '../../src/env-utils'
import path from 'path'

const baseFixturePath = path.resolve(__dirname, './fixture')

describe('Webpack', function () {
    before(function(){
        setup(this, [baseFixturePath])
    })
    it('init', function (){
        const compiler = CreateWebpackCompiler()
        let options = compiler.init({
            api: createApi()
        })
        expect(!!compiler.logger).to.be.true
        expect(options.write).to.be.true
    })
    describe('action', function() {
        this.timeout(5000 * 5)
        let compiler:CompilerExtension|null = null
        let actionInfo:ExtensionApiOptions|null = null
        let config = null
        let cwd = ''
        before(function(){
            compiler = CreateWebpackCompiler()
            const files = createFiles(baseFixturePath)
            config = createConfigFile(baseFixturePath)
            actionInfo = {
                files,
                configFiles:[config],
                context: {
                    componentDir: '',
                    componentObject: {
                        mainFile: 'index.ts'
                    },
                    rootDistFolder: path.resolve(baseFixturePath, './dist')
                }
            }
            compiler!.init({api: createApi()})

        })
        beforeEach(function(){
            cwd = process.cwd()
            process.chdir(baseFixturePath)
        })
        afterEach(function(){
            process.chdir(cwd)
        })
        it('basic bundling', function() {
            this.timeout(5 * 1000)
            return compiler!.action(actionInfo!).then(function(assets) {
                const lib = eval(assets.files[0].contents!.toString())
                expect(lib.run()).to.equal(0)
            })
        })

        it('should support filename without ending', function() {
            const configName = 'webpack2.config.js'
            const beforeChanges = actionInfo!.configFiles
            const compiler = CreateWebpackCompiler(configName)
            compiler.init({api: createApi()})
            actionInfo!.configFiles = [createConfigFile(baseFixturePath, configName)]
            return compiler!.action(actionInfo!).then(function(assets) {
                actionInfo!.configFiles = beforeChanges
                const lib = eval(assets.files[0].contents!.toString())
                expect(lib.run()).to.equal(0)
            })
        })

        it('should return multiple assets', function() {
            const configName = 'webpack3.config.js'
            const beforeChanges = actionInfo!.configFiles
            const compiler = CreateWebpackCompiler(configName)
            compiler.init({api: createApi()})
            actionInfo!.configFiles = [createConfigFile(baseFixturePath, configName)]
            return compiler!.action(actionInfo!).then(function(assets) {
                actionInfo!.configFiles = beforeChanges
                expect(assets.files.length).to.be.greaterThan(1)
            })
        })
        it('should keep entires test or ends with _test', function () {
            const configName = 'webpack4.config.js'
            const compiler:CompilerExtension = CreateWebpackCompiler(configName)
            const config = createConfigFile(baseFixturePath, configName)
            const files = createFiles(baseFixturePath)
            const actionInfo:ExtensionApiOptions = {
                files,
                configFiles:[config],
                context: {
                    componentDir: '',
                    componentObject: {
                        mainFile: 'index.ts'
                    },
                    rootDistFolder: path.resolve(baseFixturePath, './dist')
                }
            }
            compiler!.init({api: createApi()})
            return compiler.action(actionInfo).then(function (assets){
                expect(assets.files.some((file)=>file.basename === 'test.bundle.js' )).to.be.true
                expect(assets.files.some((file)=>file.basename ==='another_test.bundle.js')).to.be.true
            })

        })
    })


    describe('getDynamicPackageDependencies', function() {
        let compiler:CompilerExtension|null = null
        let config:any = null
        let context:any =  null
        let packageJSON:any =  null
        before('setting up test compiler', function() {
            setup(this, [baseFixturePath])
            compiler = CreateWebpackCompiler()
            config = createConfigFile(baseFixturePath)
            context = {
                componentDir: baseFixturePath
            }
            packageJSON = require(path.resolve(baseFixturePath, './package.json'))

        })
        it('should support use as string', function() {
            const result = compiler!.getDynamicPackageDependencies({configFiles:[config], context:context})
            expect(result).to.contain({
                'ts-loader': getVersion(packageJSON, 'ts-loader')
            })
        })
        it('should support use as array', function() {
            const result = compiler!.getDynamicPackageDependencies({configFiles:[config], context:context})
            expect(result).to.contain({
                'style-loader': getVersion(packageJSON, 'style-loader'),
                'css-loader': getVersion(packageJSON, 'css-loader')
            })
        })
        it('should support loader as string', function() {
            const result = compiler!.getDynamicPackageDependencies({configFiles:[config], context:context})
            expect(result).to.contain({
                'url-loader':getVersion(packageJSON, 'url-loader')
            })
        })
        it('should support babel-loader .babelrc file', function (){
            const fixturePath = path.resolve(__dirname, './fixture-babel')
            const configName = 'my-private-config.js'
            const compiler = CreateWebpackCompiler(configName)
            const configs = [createConfigFile(fixturePath,configName), createConfigFile(fixturePath, 'my-private-rc')]
            const packageJSON = require(path.resolve(fixturePath, './package.json'))

            const context = {
                componentDir: fixturePath
            }
            compiler.init({api: createApi()})
            const result = compiler.getDynamicPackageDependencies({configFiles: configs, context: context}, 'my-private-rc')

            const presetEnv = 'babel-preset-env'
            const restPlugin = 'babel-plugin-transform-object-rest-spread'
            const asyncPlugin = 'babel-plugin-transform-async-to-module-method'
            expect(result).to.contain({
                [presetEnv]: getVersion(packageJSON, presetEnv),
                [restPlugin]: getVersion(packageJSON, restPlugin),
                [asyncPlugin]: getVersion(packageJSON, asyncPlugin)
            })
        })
    })
})


