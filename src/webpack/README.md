Webpack
-------
A compiler component for authoring components with Webpack bundling.

#### Usage - Import

[import docs](https://docs.bitsrc.io/docs/cli-import.html#import-a-new-environment)
```bash
bit import bit.test-envs/compilers/webpack -c
```

Then build using [bit test](https://docs.bitsrc.io/docs/cli-test.html).
```bash
bit test
```

#### Usage - Configure
When you import a tester component your bit.json file will contain an env entry as following:

```Typescript
{
    "env": {
        "compiler": "bit.test-envs/compilers/webpack@0.0.9",
    }
    //...
}
```
In order to configure it we will need to change the compiler entry. The end result should look as following:

```Typescript
{
    "env": {
        "compiler": {
            "bit.test-envs/compilers/webpack@0.0.9": {
                "files": {
                    "webpack.config.js": "./webpack.config.js"
                }
            }
        }
    }
}
```

- `compiler[name].files` - should contain a `webpack.config.js` entry as key with the path to your configuration. Most commonly `webpack.config.js` file is in the project root.
- Path to `.babelrc` must be a json file.

# asset per entry
Webpack environment chooses the entry which is best suited according to your component main file. Besides that `test`, and any entry which ends with `_test` will be created by the compiler.
