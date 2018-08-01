import path from 'path'
import child_process from 'child_process'
import fs from 'fs-extra'

interface e2eHelperInfo {
    baseFixturePath:string
    mainFile:string
    compilerName:string
    confName:string
    compilerPath:string
    testerPath?:string
    compFiles?:Array<string>
    testFiles?:Array<string>
    testerConfig?:object
}

export function e2eHelper(i:e2eHelperInfo) {
    let cwd = ''
    return {
        before: function(){
            cwd = process.cwd()
            process.chdir(i.baseFixturePath)
            const bitPath = path.resolve(__dirname, '../node_modules/.bin/bit')
            // const bitPath = '/usr/local/bin/bd'
            const options = {}
            // const options = {stdio: [0,1,2]}
            const fileList = i.compFiles && i.compFiles.length > 0 ? i.compFiles.join(' '): '.'
            child_process.execSync(bitPath + ' init', options)
            child_process.execSync(`${bitPath} add ${fileList} --main ${i.mainFile} --id to-build `, options)
            if (i.testFiles && i.testFiles.length > 0) {
                child_process.execSync(`${bitPath} add -t ${i.testFiles.join(' ')} --id to-build `, options)
            }
            child_process.execSync(bitPath + ' tag to-build ', options)
            const bitJson = require(path.resolve(i.baseFixturePath, './bit.json'))
            if (i.compilerName) {
                bitJson.env.compiler = {
                    [`meta-${i.compilerName}`]: {
                        "files": {
                            [i.confName]: './' + i.confName
                        },
                        "options": {
                            "file": i.compilerPath
                        }
                    }
                }
            }
            if (i.testerPath && i.testerConfig) {
                bitJson.env.tester = i.testerConfig
            } else if (i.testerPath) {
                bitJson.env.tester = {
                    [`meta-tester`]: {
                        "files": {
                            [i.confName]: './' + i.confName
                        },
                        "options": {
                            "file": i.testerPath
                        }
                    }
                }
            }
            fs.writeFileSync('./bit.json', JSON.stringify(bitJson))
            // return child_process.execSync(`node --inspect-brk ${bitPath} ${(i.testerPath ? ' test': ' build')} --fork-level=NONE`, options)
            return child_process.execSync(`${bitPath} ${(i.testerPath ? ' test': ' build')}`, options)
        },
        after: function () {
            fs.unlinkSync(path.resolve(i.baseFixturePath, 'bit.json'))
            fs.unlinkSync(path.resolve(i.baseFixturePath, '.bitmap'))
            fs.removeSync(path.resolve(i.baseFixturePath, '.bit'))
            fs.removeSync(path.resolve(i.baseFixturePath, 'dist'))
            process.chdir(cwd)
        }
    }
}
