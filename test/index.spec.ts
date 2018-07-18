import {expect} from 'chai'
import {CreateWebpackCompiler, CompilerExtension, ExtensionApiOptions} from '../src'
import Vinyl from 'vinyl'
import path from 'path'
import fs from 'fs'
import child_process from 'child_process'

const baseFixturePath = path.resolve(__dirname, './fixtures/webpack')
//todo: clean after tests

describe('Webpack', function () {
    before(function(){
        this.timeout(1000 * 1000 * 1000)
        const cwd = process.cwd()
        process.chdir(baseFixturePath)
        child_process.execSync('npm i')
        process.chdir(cwd)
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
        let compiler:CompilerExtension|null = null
        let actionInfo:ExtensionApiOptions|null = null
        let config = null
        let cwd = ''
        before(function(){
            compiler = CreateWebpackCompiler()
            const files = createFiles()
            config = createConfigFile()
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
        it('action', function() {
            return compiler!.action(actionInfo!).then(function(bundle) {
                const lib = eval(bundle.contents!.toString())
                expect(lib.run()).to.equal(0)
            })
        })

        it('should support filename without ending', function() {
            const configName = 'webpack2.config.js'
            const beforeChanges = actionInfo!.configFiles
            const compiler = CreateWebpackCompiler(configName)
            compiler.init({api: createApi()})
            actionInfo!.configFiles = [createConfigFile(configName)]
            return compiler!.action(actionInfo!).then(function(bundle) {
                actionInfo!.configFiles = beforeChanges
                const lib = eval(bundle.contents!.toString())
                expect(lib.run()).to.equal(0)
            })
        })

        it('should return multiple assets', function() {

        })
    })


    describe('getDynamicPackageDependencies', function() {
        let compiler:CompilerExtension|null = null
        let config:any = null
        let context:any =  null
        let packageJSON:any =  null
        const getVersion = function(packageJSON:any, name:string) {
            return packageJSON.devDependencies[name]
        }
        before('setting up test compiler', function() {
            compiler = CreateWebpackCompiler()
            config = createConfigFile()
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

function createFiles() {
    return fs.readdirSync(baseFixturePath)
    .filter(function(fileName){
        return !fs.lstatSync(path.resolve(baseFixturePath, `./${fileName}`)).isDirectory()
    })
    .map(function(fileName){
        const pathToFile = path.resolve(baseFixturePath, `./${fileName}`)
        return new Vinyl({
            path: pathToFile,
            content: fs.readFileSync(pathToFile)
        })
    })
}
function createConfigFile(relativePathToConfig = './webpack.config.js') {
    const configPath = path.resolve(baseFixturePath, relativePathToConfig)
    return new Vinyl({
        path: configPath,
        contents: Buffer.from(fs.readFileSync(configPath))
    })
}

function createApi(){
    return {
        getLogger: () => ({log:console.log})
    }
}
