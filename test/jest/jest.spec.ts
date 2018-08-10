import path from 'path'
import { expect } from 'chai'
import { CreateJestTester } from '../../src'
import { createApi, createConfigFile, createFiles, setup, generatePackageJson} from '../envs-test-utils'
import { getVersion } from '../../src/env-utils';
import packageJSON from './private-package-json'


describe('jest', function () {
    before(function(){
        generatePackageJson({[fixtureAction]:packageJSON})
        setup(this, [baseFixturePath, fixtureAction])
    })

    const fixtureAction = path.resolve(__dirname, './fixture-action')
    const baseFixturePath = path.resolve(__dirname, './fixture')

    it('init', function () {
        const tester = CreateJestTester()
        const options = tester.init({ api: createApi() })
        expect(!!tester.logger).to.be.true
        expect(options.write).to.be.true
    })
    it('getDynamicPackageDependencies', function () {
        const tester = CreateJestTester()
        const context = {
            componentDir: baseFixturePath
        }
        const config = createConfigFile(baseFixturePath, 'jest.config.js')
        tester.init({
            api: createApi()
        })

        const results = tester.getDynamicPackageDependencies({ configFiles: [config], context })
        const packageJSON = require(path.resolve(baseFixturePath, './package.json'))
        expect(results).to.contain({
            'ts-jest': getVersion(packageJSON, 'ts-jest'),
            'babel-jest': getVersion(packageJSON, 'babel-jest'),
            'some-module': getVersion(packageJSON, 'some-module'),
            'dom': getVersion(packageJSON, 'dom'),
            'serialize': getVersion(packageJSON, 'serialize')
        })
    })

    it('action', function () {
        this.timeout(5000 * 10 )
        const configName = 'jest.config.js'
        const tester = CreateJestTester()
        const testFiles = createFiles(fixtureAction, [configName, 'package.json', 'package-lock.json', '.gitignore'])
        const config = createConfigFile(fixtureAction, configName)
        const actionInfo = {
            testFiles,
            configFiles: [config],
            context: {
                componentDir: fixtureAction,
                componentObject: {
                    mainFile: 'index.ts'
                },
                rootDistFolder: path.resolve(fixtureAction, './dist')
            }
        }
        tester.init({ api: createApi() })
        return tester.action(actionInfo).then(function(results) {
            expect(results.length).to.be.greaterThan(0)
            results.forEach(function(test){
                expect(!!test.specPath).to.be.true
                expect(test.failures.length, 'failing tests').to.equal(0)
                test.tests.forEach((test:any)=>expect(test.pass).to.be.true)
            })
        })
    })
})



