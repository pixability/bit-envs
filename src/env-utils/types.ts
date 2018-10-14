import Vinyl from 'vinyl'

export interface API {
  getLogger: () => Logger
}
export interface Logger {
  log: Function
  error: Function
}
export interface Options {
  write: boolean
}
// spilt interfaces
export interface ExtensionApiOptions {
  files?: Array<Vinyl>
  rawConfig?: object
  dynamicConfig?: object
  configFiles: Array<Vinyl>
  api?: any
  context: any
}

export interface ActionTesterOptions extends ExtensionApiOptions {
  testFiles: Array<Vinyl>
}

export interface CompilerExtension {
  init: ({ api }: { api: API }) => Options
  action: (info: ExtensionApiOptions) => Promise<{ files: Array<Vinyl> }>
  getDynamicPackageDependencies: (
    info: ExtensionApiOptions,
    name?: string
  ) => object
  logger?: Logger
  getDynamicConfig?: (info: ExtensionApiOptions) => any
}

export interface TesterExtension {
  logger?: Logger
  init: ({ api }: { api: API }) => Options
  action: (info: ActionTesterOptions) => Promise<Array<any>>
  getDynamicPackageDependencies: (info: ExtensionApiOptions) => object
  getDynamicConfig?: (info: ActionTesterOptions) => any
}

export interface TestResult {
  title: string
  fullTitle: string
  duration: number | undefined
  currentRetry: number
  err: object
}
