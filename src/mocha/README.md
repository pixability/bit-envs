Mocha
-----
A tester component for authoring components with mocha unit testing.

#### Usage - Import

[import docs](https://docs.bitsrc.io/docs/cli-import.html#import-a-new-environment)

```bash
bit import bit.test-envs/testers/mocha -t
```

Then build using [bit test](https://docs.bitsrc.io/docs/cli-test.html).

```bash
bit test
```

#### Usage - Configure

When you import a tester component your `bit.json` file will contain an env entry as follows:

```Typescript
{
    "env": {
        "tester": "bit.test-envs/compilers/mocha@0.0.9",
    }
    //...
}
```

Mocha compiler configuration supports the require (--require in the CLI) config option. In case you want to require component files (e.g. setup chai assertions) add the filesRequire entry to the rawConfig.

The result should look as follows:

```Typescript
{
    "env": {
        "tester": {
            "bit.test-envs/testers/mocha@0.0.9": {
                "rawConfig": {
                    "require": ["babel-core/register", "source-map-support/register"],
                    "require": ["setup.js"]
                }
            }
        }
    }
}
```

- `tester[name].rawConfig.require` - Points to node_modules mocha plugins.
- `tester[name].rawConfig.filesRequire` - Points to component setup files.

### Glob support

In Bit land, you explicitly declare test files. Any glob pattern that the tester might support will be void since only the specified files will be available.
