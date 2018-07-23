import Vinyl from 'vinyl'

export interface API {
    getLogger: () => {
        log:Function
    }
}
export interface Options {
    write: boolean
}
// spilt interfaces
export interface ExtensionApiOptions {
    files?: any
    rawConfig?: any
    dynamicConfig?: any
    configFiles: Array<Vinyl>
    api?: any
    context: any
}

export interface CompilerExtension {
    init: ({ api }: { api: API }) => Options
    action: (info: ExtensionApiOptions) => Promise<{files: Array<Vinyl>}>
    getDynamicPackageDependencies: (info: ExtensionApiOptions) => object
    logger?: any
}
