import path from 'path'
import { expect } from 'chai'
import { CreateJestTester } from '../src'
import { createApi, createConfigFile, createFiles } from './envs-test-utils'
import { getVersion } from '../src/compiler-utils';

const baseFixturePath = path.resolve(__dirname, './fixtures/jest')

describe('jest', function () {
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
        const baseFixturePath = path.resolve(__dirname, './fixtures/jest-action')
        const tester = CreateJestTester()
        const testFiles = createFiles(baseFixturePath, [configName, 'package.json', 'package-lock.json'])
        const config = createConfigFile(baseFixturePath, configName)
        const actionInfo = {
            testFiles,
            configFiles: [config],
            context: {
                componentDir: baseFixturePath,
                componentObject: {
                    mainFile: 'index.ts'
                },
                rootDistFolder: path.resolve(baseFixturePath, './dist')
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



