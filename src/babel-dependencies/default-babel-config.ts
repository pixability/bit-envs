export const defaultConfig = {
  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-react')
  ],
  sourceMaps: true,
  ast: false,
  minified: false,
  plugins: [
    [ require.resolve('@babel/plugin-proposal-decorators'), { legacy: true } ],
    require.resolve('babel-plugin-object-values-to-object-keys'),
    require.resolve('@babel/plugin-syntax-export-extensions'),
    require.resolve('@babel/plugin-proposal-class-properties')
  ]
}
