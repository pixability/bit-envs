import {expect} from 'chai'
import child_process from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import _eval from 'eval'

const e2eHelper = function(baseFixturePath:string, mainFile:string, compilerName:string, confName:string, compilerPath:string) {
    let cwd = ''
    return {
        before: function(){
            cwd = process.cwd()
            process.chdir(baseFixturePath)
            const bitPath = path.resolve(__dirname, '../node_modules/.bin/bit')
            const options = {}
            // const options = {stdio: [0,1,2]}
            child_process.execSync(bitPath + ' init', options)
            child_process.execSync(bitPath + ` add . --main ${mainFile} --id to-build `, options)
            child_process.execSync(bitPath + ' tag to-build ', options)
            const bitJson = require(path.resolve(baseFixturePath, './bit.json'))
            bitJson.env.compiler = {
                [`meta-${compilerName}`]: {
                    "files": {
                        [confName]: './' + confName
                    },
                    "options": {
                        "file": compilerPath
                    }
                }
            }
            fs.writeFileSync('./bit.json', JSON.stringify(bitJson))
            child_process.execSync(bitPath + ' build')
        },
        after: function () {
            fs.unlinkSync(path.resolve(baseFixturePath, 'bit.json'))
            fs.unlinkSync(path.resolve(baseFixturePath, '.bitmap'))
            fs.removeSync(path.resolve(baseFixturePath, '.bit'))
            fs.removeSync(path.resolve(baseFixturePath, 'dist'))
            process.chdir(cwd)
        }
    }
}
describe('E2E', function() {
    describe('webpack', function() {
        const baseFixturePath = path.resolve(__dirname, './fixtures/webpack-e2e')
        const compilerPath = path.resolve(__dirname, '../dist/webpack.js')
        const helper = e2eHelper(baseFixturePath, 'index.ts', 'webpack', 'webpack.config.js', compilerPath)
        before(function() {
            this.timeout(1000 * 1000 * 1000)
            helper.before()
        })
        after(function() {
            helper.after()
        })
        it('bit should bundle a component with webpack meta bundler', function() {
            const bundle = fs.readFileSync(path.resolve(baseFixturePath, 'dist/main.bundle.js')).toString()
            expect(eval(bundle).run()).to.equal(0)
        })
    })

    describe('babel', function () {
        const baseFixturePath = path.resolve(__dirname, './fixtures/babel')
        const compilerPath = path.resolve(__dirname, '../dist/babel.js')
        const helper = e2eHelper(baseFixturePath, 'b.js', 'babel', '.babelrc', compilerPath)
        before(function () {
            this.timeout(1000 * 1000 * 1000)
            helper.before()
        })
        after(function () {
            helper.after()
        })
        it('bit should transpile component with babel meta compiler', function () {
            const transpiled = fs.readFileSync(path.resolve(baseFixturePath, 'dist/b.js')).toString()
            expect(_eval(transpiled).run()).to.equal(0)
        })
    })
})
