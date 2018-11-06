Jest
-----
A tester component for authoring components with jest unit testing.

#### Usage - Import
[import docs](https://docs.bitsrc.io/docs/cli-import.html#import-a-new-environment)

```bash
bit import bit.test-envs/testers/jest -t
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
        "tester": "bit.test-envs/compilers/jest@0.0.9",
    }
    //...
}
```

To configure it, we will need to change the tester entry. The result should look as follows:

```Typescript
{
    "env": {
        "tester": {
            "bit.test-envs/testers/jest@0.0.9": {
                "files": {
                    "jest.config.js": "./jest.config.js"
                }
            }
        }
    }
}
```

- `tester[name].files` - must contain a `jest.config.js` entry as key with the path to your configuration. Most commonly `jest.config.js` file is in the project root.
- Path to configuration file must be a JS file which exports jest config object.

### Glob support

In Bit you explicitly declare test files. Glob patterns that the tester might support will be void since only the specified files will be available.
