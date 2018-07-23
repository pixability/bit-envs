import path from 'path'
import fs from 'fs-extra'
import _get from 'lodash.get'

export function loadPackageJsonSync(componentDir: string, workspaceDir: string) {
    const packageJsonName = 'package.json'
    let packageJsonPath
    if (componentDir) {
        packageJsonPath = path.join(componentDir, packageJsonName)
        const packageJson = loadPackageJsonFromPathSync(packageJsonPath)
        if (packageJson) {
            return packageJson
        }
    }
    packageJsonPath = path.join(workspaceDir, packageJsonName)
    return loadPackageJsonFromPathSync(packageJsonPath)
}

function loadPackageJsonFromPathSync(packageJsonPath: string) {
    return fs.pathExistsSync(packageJsonPath) ? fs.readJsonSync(packageJsonPath) : undefined
}

export function getVersion(packageJSON:any, name:string) {
    return _get(packageJSON, `dependencies[${name}]`) ||
           _get(packageJSON, `devDependencies[${name}]`) ||
           _get(packageJSON, `peerDependencies[${name}]`)
}
