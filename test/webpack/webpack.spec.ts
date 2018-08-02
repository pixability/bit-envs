import {expect} from 'chai'
import {CreateWebpackCompiler} from '../../src'
import {CompilerExtension, ExtensionApiOptions} from '../../src/env-utils'
import {createApi, createConfigFile, createFiles, npmInstallFixture} from '../envs-test-utils'
import {getVersion} from '../../src/env-utils'
import path from 'path'

const baseFixturePath = path.resolve(__dirname, './fixture')

describe('Webpack', function () {
    before(function(){
        npmInstallFixture(this, [baseFixturePath])
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
    })


    describe('getDynamicPackageDependencies', function() {
        let compiler:CompilerExtension|null = null
        let config:any = null
        let context:any =  null
        let packageJSON:any =  null
        before('setting up test compiler', function() {
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
    })
})


