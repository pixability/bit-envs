import path from 'path'
import Vinyl from 'vinyl'
import fs from 'fs'
import _get from 'lodash.get'

export function createApi(){
    return {
        getLogger: () => ({log:console.log})
    }
}

export function  createConfigFile(baseFixturePath:string, name = 'webpack.config.js'):Vinyl {
    const configPath = path.resolve(baseFixturePath, name)
    return new Vinyl({
        name: name,
        path: configPath,
        contents: Buffer.from(fs.readFileSync(configPath))
    })
}

export function getVersion(packageJSON:any, name:string) {
    return _get(packageJSON, `dependencies[${name}]`) || _get(packageJSON, `devDependencies[${name}]`)
}

export function createFiles(fixturePath:string, skipFiles:Array<string> = []) {
    return fs.readdirSync(fixturePath)
    .filter(function(fileName){
        return !fs.lstatSync(path.resolve(fixturePath, `./${fileName}`)).isDirectory() && !~skipFiles.indexOf(fileName)
    })
    .map(function(fileName){
        const pathToFile = path.resolve(fixturePath, `./${fileName}`)
        return new Vinyl({
            path: pathToFile,
            contents: Buffer.from(fs.readFileSync(pathToFile))
        })
    })
}
