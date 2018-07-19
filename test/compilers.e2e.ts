import {expect} from 'chai'
import child_process from 'child_process'
import path from 'path'
import fs from 'fs-extra'
const baseFixturePath = path.resolve(__dirname, './fixtures/webpack-e2e')

describe('E2E', function() {
    let cwd = ''
    before(function() {
        this.timeout(1000 * 1000 * 1000)
        cwd = process.cwd()
        process.chdir(baseFixturePath)
        child_process.execSync('../../../node_modules/.bin/bit init')
        child_process.execSync('../../../node_modules/.bin/bit add . --main index.ts --id to-build')
        child_process.execSync('../../../node_modules/.bin/bit tag to-build')
        const bitJson = require(path.resolve(baseFixturePath, 'bit.json'))
        bitJson.env.compiler = {
            "meta-webpack": {
                "files": {
                  "webpack.config.js": "./webpack.config.js"
                },
                "options": {
                    "file": path.resolve(cwd, "dist/webpack.js")
                }
            }
        }
        fs.writeFileSync('./bit.json', JSON.stringify(bitJson))
        child_process.execSync('../../../node_modules/.bin/bit build')
    })
    after(function() {
        fs.unlinkSync(path.resolve(baseFixturePath, 'bit.json'))
        fs.unlinkSync(path.resolve(baseFixturePath, '.bitmap'))
        fs.removeSync(path.resolve(baseFixturePath, '.bit'))
        fs.removeSync(path.resolve(baseFixturePath, 'dist'))
        process.chdir(cwd)
    })
    it('bit should bundle a component with webpack meta bundler', function() {
        const bundle = fs.readFileSync(path.resolve(baseFixturePath, 'dist/main.bundle.js')).toString()
        expect(eval(bundle).run()).to.equal(0)
    })
})

