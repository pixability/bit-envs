import {expect} from 'chai'
import path from 'path'
import fs from 'fs-extra'
import _eval from 'eval'
import {e2eHelper} from './e2e-helper'

describe('E2E', function() {
    describe('webpack', function() {
        const baseFixturePath = path.resolve(__dirname, './fixtures/webpack-e2e')
        const compilerPath = path.resolve(__dirname, '../dist/webpack.js')
        const helper = e2eHelper({
            baseFixturePath,
            mainFile:'index.ts',
            compilerName:'webpack',
            confName:'webpack.config.js',
            compilerPath})
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
        const helper = e2eHelper({baseFixturePath,
            mainFile:'b.js',
            compilerName:'babel',
            confName: '.babelrc',
            compilerPath})
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
    describe('mocha', function (){
        const baseFixturePath = path.resolve(__dirname, './fixtures/mocha')
        const compilerPath = path.resolve(__dirname, '../dist/babel.js')
        const testerPath = path.resolve(__dirname, '../dist/mocha/mocha.js')
        const testerConfig = {
            [`meta-tester`]: {
                rawConfig: {
                    "require": ["babel-core/register", "source-map-support/register"],
                    "filesRequire": ["setup.js"]
                },
                "options": {
                    "file": testerPath
                }
            }
        }
        const helper = e2eHelper({
            baseFixturePath,
            mainFile:'index.js',
            compilerName:'babel',
            confName: '.babelrc',
            compilerPath,
            testerPath,
            compFiles:['index.js', 'add.js', 'sub.js', 'setup.js'],
            testFiles:['test.spec.js'],
            testerConfig
        })
        let mainCommandResult = ''
        before(function () {
            this.timeout(1000 * 1000 * 1000)
            mainCommandResult = helper.before().toString()
        })
        after(function () {
            helper.after()
        })
        it('bit should test component with mocha meta tester', function () {
            expect(mainCommandResult).to.contain('tests passed')
            expect(mainCommandResult).to.not.contain('tests failed')
        })
    })
    describe('jest', function (){
        const baseFixturePath = path.resolve(__dirname, './fixtures/jest-action')
        const compilerPath = ''
        const testerPath = path.resolve(__dirname, '../dist/jest/jest.js')
        const helper = e2eHelper({baseFixturePath,
            mainFile:'index.ts',
            compilerName:'',
            confName: 'jest.config.js',
            compilerPath,
            testerPath,
            compFiles:['index.ts', 'add.ts', 'sub.ts', 'setup.ts'],
            testFiles:['test.spec.ts', 'test2.spec.ts']
        })
        let mainCommandResult = ''
        before(function () {
            this.timeout(1000 * 1000 * 1000)
            mainCommandResult = helper.before().toString()
        })
        after(function () {
            helper.after()
        })
        it('bit should test component with jest meta tester', function () {
            expect(mainCommandResult).to.contain('tests passed')
            expect(mainCommandResult).to.not.contain('tests failed')
        })
    })
})
