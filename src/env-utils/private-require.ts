import path from 'path'
import fs from 'fs-extra'

const IGNORE_FOLDER = '.bitTmp'
const defaultBodyExpression = 'require(pathToModule)'

export function createPrivateRequire(directory:string, bodyExpression = defaultBodyExpression, folder = IGNORE_FOLDER) {
    const privateRequireContent = `
    function privateRequire(pathToModule){
        return ${bodyExpression}
    }
    module.exports = privateRequire
    `
    const tempFolderInComp = path.resolve(directory, folder)
    if(!fs.existsSync(tempFolderInComp)) {
        fs.mkdirpSync(tempFolderInComp)
    }
    const pathToDynamicScript = path.resolve(tempFolderInComp, 'private-require.js')
    fs.writeFileSync(pathToDynamicScript, privateRequireContent, { encoding:'utf8' })

    return require(pathToDynamicScript)

}

export function cleanPrivateRequire(directory:string , folder = IGNORE_FOLDER) {
    const pathToDynamicScript = path.resolve(directory, folder, 'private-require.js')
    fs.unlinkSync(pathToDynamicScript)

}
