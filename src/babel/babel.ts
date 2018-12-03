import { API, ExtensionApiOptions } from '../env-utils/types'
import {
  babelFindConfiguration,
  getBabelPackageDependencies,
} from '../babel-dependencies'

export function CreateBabelCompiler (name = '.babelrc') {
  const metaBabelCompiler: any = {
    init: function ({ api }: { api: API }) {
      metaBabelCompiler.logger = api.getLogger()
      return {
        write: true
      }
    },
    getDynamicConfig: function (info: ExtensionApiOptions) {
      const config = babelFindConfiguration(info, name)
      return config.save ? config.config : info.rawConfig
    },
    action: async function (info: ExtensionApiOptions, write: any, exec: any) {
      const relativePaths = (info.files || []).map((f:any) => f.relative)
      const babelRcJs = `
module.exports = {
  presets: [
    [require.resolve("@babel/preset-env"), { loose: true, exclude: [/transform-typeof-symbol/] }],
    require.resolve("@babel/preset-flow")
  ],
  plugins: [cjs && "add-module-exports", "annotate-pure-calls"].filter(Boolean)
};
`
      await write({
        '.babelrc.js': babelRcJs
      })
      // TODO: actually write files and build
    },
    getDynamicPackageDependencies: function (info: any) {
      return getBabelPackageDependencies(name, info)
    }
  }
  return metaBabelCompiler
}

export default CreateBabelCompiler()
