import path from 'path'
import child_process from 'child_process'
import fs from 'fs-extra'

interface E2eHelperInfo {
  baseFixturePath: string
  mainFile: string
  compilerName: string
  confName: Array<string>
  compilerPath: string
  testerPath?: string
  compFiles?: Array<string>
  testFiles?: Array<string>
  testerConfig?: object,
  compilerConfig?: object
}

export function e2eHelper (i: E2eHelperInfo) {
  let cwd = ''
  return {
    before: function () {
      cwd = process.cwd()
      process.chdir(i.baseFixturePath)
      const bitPath = require.resolve('bit-bin/bin/bit.js')
      const options = {}
      const fileList =
        i.compFiles && i.compFiles.length > 0 ? i.compFiles.join(' ') : '.'
      child_process.execSync(bitPath + ' init', options)
      child_process.execSync(
        `${bitPath} add ${fileList} --main ${i.mainFile} --id to-build `,
        options
      )
      i.testFiles &&
        i.testFiles.forEach(tFile => {
          child_process.execSync(
            `${bitPath} add -t ${tFile} --id to-build `,
            options
          )
        })
      child_process.execSync(bitPath + ' tag to-build ', options)
      const bitJson = require(path.resolve(i.baseFixturePath, './bit.json'))
      const files = i.confName.reduce(function (
        prev: { [k: string]: string },
        curr
      ) {
        prev[curr] = './' + curr
        return prev
      },
      {})

      if (i.compilerName && i.compilerConfig) {
        bitJson.env.compiler = i.compilerConfig
      } else if (i.compilerName) {
        bitJson.env.compiler = {
          [`meta-${i.compilerName}`]: {
            files,
            options: {
              file: i.compilerPath
            }
          }
        }
      }
      if (i.testerPath && i.testerConfig) {
        bitJson.env.tester = i.testerConfig
      } else if (i.testerPath) {
        bitJson.env.tester = {
          [`meta-tester`]: {
            files,
            options: {
              file: i.testerPath
            }
          }
        }
      }
      fs.writeFileSync('./bit.json', JSON.stringify(bitJson, null, 2))
      return child_process.execSync(
        `${bitPath} ${i.testerPath ? ' test' : ' build'}`,
        options
      )
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
