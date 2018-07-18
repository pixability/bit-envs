import {expect} from 'chai'
import {CreateWebpackCompiler, CompilerExtension} from '../src'
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
    it('action', function() {
        const compiler = CreateWebpackCompiler()
        const files = createFiles()
        const config = createConfigFile()
        const cwd = process.cwd()
        process.chdir(baseFixturePath)
        compiler.init({api: createApi()})
        return compiler.action({ files, configFiles:[config], context: {
            componentDir: '',
            componentObject: {
                mainFile: 'index.ts'
            },
            rootDistFolder: path.resolve(baseFixturePath, './dist')
        }}).then(function(bundle){
            process.chdir(cwd)
            const lib = eval(bundle.contents!.toString())
            expect(lib.run()).to.equal(0)
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
function createConfigFile() {
    const configPath = path.resolve(baseFixturePath, './webpack.config.js')
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
