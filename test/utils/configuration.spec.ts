import { setup, generatePackageJson, createExtensionInfo } from '../envs-test-utils'
import path from 'path'
import {findConfiguration, FindStrategy , defaultGetBy} from '../../src/env-utils/find-configuration'
import { expect, use } from 'chai';
import subset from 'chai-subset'
import {ignoreList} from '../babel/ignore-list'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import fs  from 'fs-extra'

use(subset)
use(sinonChai)
describe('configuration', function() {
    const configPackageFixturePath = path.resolve( __dirname, 'fixture-config-package')
    const configFileFixturePath = path.resolve( __dirname, 'fixture-config-bit-file')
    const configBitRawFixturePath = path.resolve( __dirname, 'fixture-config-bit-raw')
    let packageJson = {
        babel: {
            presets: ['latest', 'react'],
            sourceMaps: true,
            ast: false,
            minified: false,
            plugins: [
                'babel-plugin-inline-react-svg',
                ['transform-object-rest-spread', { useBuiltIns: true }],
                'transform-decorators-legacy',
                'transform-object-entries',
                'object-values-to-object-keys',
                'transform-export-extensions',
                'transform-class-properties',
                'transform-async-to-generator',
                ['transform-react-jsx', { useBuiltIns: true }],
                ['transform-regenerator', { async: false }]
            ],
            ignore: ['**/*.svg']
        }
    }
    before(function() {
        generatePackageJson({
            [configPackageFixturePath]: packageJson,
            [configFileFixturePath]: packageJson,
            [configBitRawFixturePath]: {}
        })
        setup(this, [configPackageFixturePath, configFileFixturePath])
    })

    it('should be found in package.json', function() {
        const info = createExtensionInfo('.babelrc', configPackageFixturePath, ignoreList )
        const config = findConfiguration(info, {pjKeyName:'babel', fileName:''})
        expect(config.config).to.deep.equal(packageJson.babel)
        expect(config.save).to.be.true
    })

    it('should read from raw config bit.json', function() {
        const info = createExtensionInfo('.babelrc', configBitRawFixturePath, ignoreList )
        const findOptions = {pjKeyName:'babel', fileName: '.babelrc'}
        const rawConfig = {[findOptions.pjKeyName]:{'lol':'wow'}}
        info['rawConfig'] = rawConfig
        const config = findConfiguration(info, findOptions)
        expect(config.config).to.deep.equal(rawConfig[findOptions.pjKeyName])
        expect(config.save).to.be.false
    })

    it('should fallback to default config', function() {
        const info = createExtensionInfo('.babelrc', configBitRawFixturePath, ignoreList )
        const config = findConfiguration(info, {pjKeyName:'babel', fileName: '.babelrc'})
        expect(config.config).to.deep.equal({})
        expect(config.save).to.be.false
    })

    it('should always override with raw', function (){
        const info = createExtensionInfo('.babelrc', configFileFixturePath, ignoreList )
        const findOptions = {pjKeyName:'babel', fileName: '.babelrc'}
        const rawConfig = {[findOptions.pjKeyName]:{'ast':'true'}}
        info['rawConfig'] = rawConfig
        const config = findConfiguration(info, findOptions)
        const subset = fs.readJSONSync(path.resolve(configFileFixturePath, '.babelrc'))
        delete subset.ast
        expect(config.config).to.containSubset(subset)
        expect(config.config).to.containSubset(rawConfig[findOptions.pjKeyName])
    })

    it('should support dynamic strategy order', function () {
        const info = createExtensionInfo('.babelrc', configBitRawFixturePath, ignoreList )
        const strategyRegistry:{[k:string]:sinon.SinonSpy} = {
            [FindStrategy.default]: sinon.spy(),
            [FindStrategy.pjKeyName]: sinon.spy(),
            [FindStrategy.fileName]: sinon.spy(),
            [FindStrategy.raw]: sinon.spy(defaultGetBy.raw)
        }
        const config = findConfiguration(info, {pjKeyName:'babel', fileName: '.babelrc', strategy: []}, strategyRegistry)
        expect(config.config).to.deep.equal({})
        Object.keys(strategyRegistry).forEach((element:string) => {
            return element === FindStrategy.raw ?
                expect(strategyRegistry[element]).to.be.calledOnce :
                expect(strategyRegistry[element]).not.be.called
        })
    })

    it('should support dynamicConfig', function(){
        const info = createExtensionInfo('.babelrc', configBitRawFixturePath, ignoreList )
        const findOptions = {pjKeyName:'babel', fileName: '.babelrc'}
        const dynamicConfig = {[findOptions.pjKeyName]:{'lol':'wow'}}
        info['dynamicConfig'] = dynamicConfig
        const config = findConfiguration(info, findOptions)
        //@ts-ignore
        expect(config.config[findOptions.pjKeyName]).to.deep.equal(dynamicConfig[findOptions.pjKeyName])
        expect(config.save).to.be.false
    })

    describe('by file', function(){
        it('should should support happy flow', function(){
            const info = createExtensionInfo('.babelrc', configFileFixturePath, ignoreList )
            const config = findConfiguration(info, {pjKeyName:'babel', fileName: '.babelrc'})
            expect(config.config).to.deep.equal(fs.readJSONSync(path.resolve(configFileFixturePath, '.babelrc')))
            expect(config.save).to.be.false
        })

        it('should support default file paths', function() {
            const info = createExtensionInfo('.lol', configFileFixturePath, ignoreList )
            const findOptions = {
                pjKeyName: 'babel',
                fileName: '.babelrc',
                defaultFilePaths: ['./.babelrc']

            }
            try {
                findConfiguration(info, findOptions )
            } catch(e) {
                return
            }
            expect.fail('', '', 'find configuration should throw')


            // expect(config.config).to.deep.equal(fs.readJSONSync(path.resolve(configFileFixturePath, '.babelrc')))
            // expect(config.save).to.be.true
        })

    })
    xit('should support non standard json file', function(){})


})

/***
 *
 * add dynamic handler - do not return
 * default = do not return
 * file = do not return
 * raw = do not return
 * packageJson = return to consumer
 * defaultFilePath = return to consumer
 *
 */
