import {expect} from 'chai'
import {CreateWebpackCompiler} from '../src'
import Vinyl from 'vinyl'
import path from 'path'
import fs from 'fs'

const baseFixturePath = path.resolve(__dirname, './fixtures/webpack')
//todo: npm install fixture before starting
//todo: clean after tests

describe('Webpack', function () {
    it('init', function (){
        const compiler = CreateWebpackCompiler()
        let options = compiler.init({
            api: {
                getLogger: () => ({log:console.log})
            }
        })
        expect(!!compiler.logger).to.be.true
        expect(options.write).to.be.true
    })
    it('action', function() {
        const compiler = CreateWebpackCompiler()
        const files = fs.readdirSync(baseFixturePath)
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
        const configPath = path.resolve(baseFixturePath, './webpack.config.js')
        const config = new Vinyl({
            path: configPath,
            content: fs.readFileSync(configPath)
        })
        const cwd = process.cwd()
        process.chdir(baseFixturePath)
        return compiler.action({files, configFiles:[config], context: {
            componentDir: '',
            componentObject: {
                mainFile: 'index.ts'
            },
            rootDistFolder: {}
        }}).then(function(bundle){
            process.chdir(cwd)
            const lib = eval(bundle.content)
            expect(lib.run()).to.equal(0)
        })

    })

    describe('getDynamicPackageDependencies', function() {
        let helpers:any = {
            compiler: null,
            config: null,
            context: null,
            packageJSON: null
        }
        const getVersion = function(packageJSON:any, name:string) {
            return packageJSON.devDependencies[name]
        }
        before('setting up test compiler', function() {
            const configPath = path.resolve(baseFixturePath, './webpack.config.js')
            helpers.compiler = CreateWebpackCompiler()
            helpers.config = new Vinyl({
                path: configPath,
                content: fs.readFileSync(configPath)
            })
            helpers.context = {
                componentDir: baseFixturePath
            }
            helpers.packageJSON = require(path.resolve(baseFixturePath, './package.json'))

        })
        it('should support use as string', function() {
            const result = helpers.compiler.getDynamicPackageDependencies({configFiles:[helpers.config], context:helpers.context})
            expect(result).to.contain({
                'ts-loader': getVersion(helpers.packageJSON, 'ts-loader')
            })
        })
        it('should support use as array', function() {
            const result = helpers.compiler.getDynamicPackageDependencies({configFiles:[helpers.config], context:helpers.context})
            expect(result).to.contain({
                'style-loader': getVersion(helpers.packageJSON, 'style-loader'),
                'css-loader': getVersion(helpers.packageJSON, 'css-loader')
            })
        })
        it('should support loader as string', function() {
            const result = helpers.compiler.getDynamicPackageDependencies({configFiles:[helpers.config], context:helpers.context})
            expect(result).to.contain({
                'url-loader':getVersion(helpers.packageJSON, 'url-loader')
            })
        })
    })
})
