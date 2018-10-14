import path from 'path'
import Vinyl from 'vinyl'
import fs from 'fs-extra'
import _get from 'lodash.get'
import child_process from 'child_process'

export function createApi () {
  return {
    getLogger: () => ({
      log: console.log,
      error: console.error
    })
  }
}

export function createConfigFile (
  baseFixturePath: string,
  name = 'webpack.config.js'
): Vinyl {
  const configPath = path.resolve(baseFixturePath, name)
  return new Vinyl({
    name: name,
    path: configPath,
    contents: Buffer.from(fs.readFileSync(configPath))
  })
}

export function getVersion (packageJSON: any, name: string) {
  return (
    _get(packageJSON, `dependencies[${name}]`) ||
    _get(packageJSON, `devDependencies[${name}]`)
  )
}

export function createFiles (
  fixturePath: string,
  skipFiles: Array<string> = [],
  acceptRule: string | null = null
): Array<Vinyl> {
  return fs
    .readdirSync(fixturePath)
    .filter(function (fileName) {
      return (
        (acceptRule && fileName.endsWith(acceptRule)) ||
        (!fs
          .lstatSync(path.resolve(fixturePath, `./${fileName}`))
          .isDirectory() &&
          !~skipFiles.indexOf(fileName))
      )
    })
    .map(function (fileName) {
      const pathToFile = path.resolve(fixturePath, `./${fileName}`)
      return new Vinyl({
        path: pathToFile,
        contents: Buffer.from(fs.readFileSync(pathToFile))
      })
    })
}

export function setup (context: Mocha.Context, paths: Array<string>) {
  if (process.env['NO_INSTALL']) {
    return
  }

  context.timeout(1000 * 1000)
  paths.forEach(function (fixturePath) {
    if (
      fs.lstatSync(fixturePath).isDirectory() &&
      !fs.existsSync(path.resolve(fixturePath, '.npm-skip'))
    ) {
      const cwd = process.cwd()
      process.chdir(fixturePath)
      child_process.execSync('npm i')
      process.chdir(cwd)
    }
  })
}

export function generatePackageJson (toInstall: { [path: string]: any }) {
  Object.keys(toInstall).forEach(function (fixturePath: string) {
    if (fs.lstatSync(fixturePath).isDirectory()) {
      fs.writeJSONSync(`${fixturePath}/package.json`, toInstall[fixturePath])
    }
  })
}

export function createExtensionInfo (
  configName: string,
  fixturePath: string,
  skipFiles: Array<string> = []
): any {
  const files = createFiles(fixturePath, skipFiles)
  const config = fs.existsSync(path.resolve(fixturePath, configName))
    ? createConfigFile(fixturePath, configName)
    : null
  return {
    files,
    configFiles: config ? [config] : [],
    context: {
      componentDir: fixturePath,
      componentObject: {
        mainFile: ''
      },
      rootDistDir: path.resolve(fixturePath, './dist')
    },
    rawConfig: {}
  }
}
