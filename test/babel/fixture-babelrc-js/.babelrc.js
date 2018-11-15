const myFavoritePlugin = () => "@babel/plugin-proposal-object-rest-spread"

module.exports = {
    "presets": ["@babel/env"],
    "sourceMaps": true,
    "minified": true,
    "plugins": [
      myFavoritePlugin(),
      ["@babel/plugin-transform-async-to-generator", {
        "module": "bluebird",
        "method": "coroutine"
      }]
    ]
}
