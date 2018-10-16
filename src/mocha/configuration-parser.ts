import { ExtensionApiOptions } from '../env-utils'
import _pickBy from 'lodash.pickby'
import _isNil from 'lodash.isnil'
import { Command } from 'commander'
import path from 'path'

// taken from: https://github.com/mochajs/mocha/blob/5ec3010409063685a4aa86480c784a562cc3b65b/bin/options.js#L33-L39
const parseOpts = (rawConfig: string) =>
  rawConfig
    .replace(/^#.*$/gm, '')
    .replace(/\\\s/g, '%20')
    .split(/\s/)
    .filter(Boolean)
    .map(value => value.replace(/%20/g, ' '))

// parse arguments in the same way mocha does,
// but include only options we know how to handle
const createParser = (opts: Array<string>) => {
  const program = new Command()
  program
    .allowUnknownOption()
    .option('-b, --bail')
    .option('-g, --grep <pattern>')
    .option('-r, --require <name>')
    .option('-s, --slow <ms>')
    .option('-t, --timeout <ms>')
    .option('--retries <times>')
    .parse(['', ''].concat(opts))
  return program
}

const addDotSlashPrefIfAbsent = (file: string) => file.replace(/^\.\/|^/, './')
// bit constructs vinyls with a relative path absent of ./ (eg. setup.js)
// relative paths intended for the require function require ./ (eg. ./setup.js)
// in order to compare between them, we make sure both have it

const throwOnMissingRequires = (parser: any, info: ExtensionApiOptions) => {
  const externalFiles = parser.require ? [parser.require] : []
  const configFiles = info.configFiles.map(f => f.relative)
  const missingConfigFiles = externalFiles.filter((f: string) => {
    return !configFiles.find(
      cFile => addDotSlashPrefIfAbsent(cFile) === addDotSlashPrefIfAbsent(f)
    )
  })
  if (missingConfigFiles.length > 0) {
    throw new Error(
      'Bit cannot support files --required in mocha.opts unless they are ' +
      'added to the files field in the tester configuration in bit.json ' +
      `To make this error go away, add ${missingConfigFiles.join(', ')} ` +
      'to the files field in the tester configuration in bit.json'
    )
  }
}

const throwOnAbsolutePaths = (parser: any) => {
  const externalFiles = parser.require ? [parser.require] : []
  const requiresWithAbsolutePaths = externalFiles.filter(
    (f: string) => path.isAbsolute(f)
  )
  if (requiresWithAbsolutePaths.length > 0) {
    throw new Error(
      'Bit does not support --requiring absolute paths. ' +
      'To make this error go away, use relative path for ' +
      requiresWithAbsolutePaths.join(', ')
    )
  }
}

export function configurationParser (
  rawConfig: string,
  info: ExtensionApiOptions
) {
  const opts = parseOpts(rawConfig)
  const parser = createParser(opts)
  const config = _pickBy(
    {
      bail: parser.bail,
      grep: parser.grep,
      slow: parser.slow,
      timeout: parser.timeout,
      retries: parser.retries,
      mochaRequire: parser.require
    },
    (k: any) => !_isNil(k)
  )
  throwOnAbsolutePaths(parser)
  throwOnMissingRequires(parser, info)
  return config
}
