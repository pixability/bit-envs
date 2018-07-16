import {expect} from 'chai'
import {CreateWebpackCompiler} from '../src'
import Vinyl from 'vinyl'
import path from 'path'
import fs from 'fs'

const baseFixturePath = path.resolve(__dirname, './fixtures/webpack')

describe('Webpack', function () {

    it('init', function (){
        const compiler = CreateWebpackCompiler()
        let options = compiler.init({
            api: {
                getLogger: () => ({})
            }
        })
        expect(!!compiler.logger).to.be.true
        expect(options.write).to.be.true
    })
    it('action', function() {
        
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
