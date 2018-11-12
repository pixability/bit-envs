import * as path from 'path'
import fs from 'fs-extra'
import _get from 'lodash.get'
import Vinyl from 'vinyl'

export function loadPackageJsonSync (
  componentDir: string,
  workspaceDir: string
) {
  const packageJsonPath = componentDir
    ? path.join(componentDir, 'package.json')
    : path.join(workspaceDir, 'package.json')
  if (!componentDir && !workspaceDir) return null
  return loadPackageJsonFromPathSync(packageJsonPath)
}

function loadPackageJsonFromPathSync (packageJsonPath: string) {
  return fs.pathExistsSync(packageJsonPath)
    ? fs.readJsonSync(packageJsonPath)
    : undefined
}

export function getVersion (packageJSON: object, name: string) {
  return (
    _get(packageJSON, `dependencies[${name}]`) ||
    _get(packageJSON, `devDependencies[${name}]`) ||
    _get(packageJSON, `peerDependencies[${name}]`)
  )
}

export function fillDependencyVersion (
  packageJson: object,
  name: string,
  toFill: { [k: string]: string }
) {
  const version = getVersion(packageJson, name)
  if (version) {
    toFill[name] = version
  }
  return version
}

export function findByName (files: Array<Vinyl>, name: string) {
  const file = files.find((config: Vinyl) => {
    return config.name === name
  })
  if (!file) {
    throw new Error(`Could not find ${name}`)
  }
  return file
}
