import path from 'path'
import {expect} from 'chai'
import {CreateMochaTester} from '../src'
import {createApi, createFiles} from './envs-test-utils'
import { getVersion } from '../src/compiler-utils';

const baseFixturePath = path.resolve(__dirname, './fixtures/mocha')

describe('mocha', function () {
    it('init', function () {
        const tester = CreateMochaTester()
        const options = tester.init({ api: createApi() })
        expect(!!tester.logger).to.be.true
        expect(options.write).to.be.false

    })
    describe('getDynamicPackageDependencies', function(){
        this.timeout(5000)
        it('getDynamicPackageDependencies', function () {
            const tester = CreateMochaTester()
            const context = {
                componentDir: baseFixturePath
            }
            tester.init({
                api: createApi()
            })

            const dynamicConfig = {
                "require": ["babel-core/register", "source-map-support/register"],
                "filesRequire": ["setup.js"]
            }
            const results = tester.getDynamicPackageDependencies({configFiles:[], context, dynamicConfig})

            const packageJSON = require(path.resolve(baseFixturePath, './package.json'))
            expect(results).to.contain({
                "babel-core":getVersion(packageJSON, "babel-core"),
                "source-map-support": getVersion(packageJSON, "source-map-support")
            })
        })
    })

    it('action', function () {
        const tester = CreateMochaTester()
        const testFiles = createFiles(baseFixturePath, ['.babelrc', 'package.json', 'package-lock.json'])
        const actionInfo = {
            testFiles,
            configFiles: [],
            context: {
                componentDir: baseFixturePath,
                componentObject: {
                    mainFile: '',
                    dynamicConfig: {
                        "require": ["babel-core/register", "source-map-support/register"],
                        "filesRequire": ["setup.js"]
                    }
                },
                rootDistFolder: path.resolve(baseFixturePath, './dist')
            }
        }
        tester.init({
            api:createApi()
        })
        return tester.action(actionInfo)
            .then(function(results){
                expect((global as any).mochaSetupTestRun, 'setup.js').to.be.true
                const babelCore = Object.keys(require.cache).find((elem) => !!~elem.indexOf('babel-core/register'))
                expect(babelCore, 'babel-core').to.contain('fixtures/mocha')
                const withFailures = results.find((item)=>item.specPath.endsWith('test2.spec.js'))
                const allPassing = results.find((item)=>item.specPath.endsWith('test.spec.js'))
                expect(withFailures.failures.length).to.equal(3)
                expect(allPassing.failures.length).to.equal(0)
            })
    })
})



