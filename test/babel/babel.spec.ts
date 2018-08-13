/// <reference path='eval.d.ts' />
import { expect } from 'chai'
import { CreateBabelCompiler } from '../../src/babel'
import { createApi, createConfigFile, createFiles, setup, generatePackageJson } from '../envs-test-utils'
import { getVersion } from '../../src/env-utils'
import path from 'path'
import Vinyl from 'vinyl'
import _eval from 'eval'

import packageJSON from './private-package-json'
import packageJSONResolve from './private-package-json-resolve'

const baseFixturePath = path.resolve(__dirname, './fixture')
const resolveFixture = path.resolve(__dirname, 'fixture-resolve')
const ignoreList = [
    '.babelrc',
    'package.json',
    'package-lock.json',
    '.babelrc.only',
    '.babelrc.ignore',
    '.babelrc.empty',
    '.gitignore']

describe('babel', function () {
    before(function() {
        generatePackageJson({
            [baseFixturePath]:packageJSON,
            [resolveFixture]:packageJSONResolve
        })
        setup(this, [baseFixturePath, resolveFixture])
    })
    it('init', function () {
        const compiler = CreateBabelCompiler()
        const options = compiler.init({
            api: createApi()
        })
        expect(!!compiler.logger).to.be.true
        expect(options.write).to.be.true
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
    it('action empty', function () {
        const baseFixturePath = path.resolve(__dirname, './fixture-empty')
        return runCompilerAction('.babelrc.empty', baseFixturePath)
            .then(function(assets){
                const file = assets.files.find((file:Vinyl)=> file.basename == 'b.js')
                expect(file!.basename).to.equal('b.js')
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
    it('babel should be able to resolve files', function () {
        return runCompilerAction('.babelrc', resolveFixture)
        .then(function(assets){
            assets.files.forEach(function(file){
                expect(file.basename).to.not.contain('.svg')
            })
        }).catch(function(reason){
            expect.fail('compilation should not throw', 'it did', reason)
        })
    })
})

function runCompilerAction(configName:string, fixturePath:string = baseFixturePath) {

    const compiler = CreateBabelCompiler(configName)
    const files = createFiles(fixturePath, ignoreList)
    const config = createConfigFile(fixturePath, configName)
    const actionInfo = {
        files,
        configFiles: [config],
        context: {
            componentDir: fixturePath,
            componentObject: {
                mainFile: ''
            },
            rootDistFolder: path.resolve(fixturePath, './dist')
        }
    }
    compiler.init({ api: createApi() })
    return compiler.action(actionInfo)
}
