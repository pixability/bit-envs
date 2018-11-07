Babel
-----
A compiler component for authoring babel based components.

#### Usage - Import

```bash
bit import bit.test-envs/compilers/babel -c
```
[import docs](https://docs.bitsrc.io/docs/cli-import.html#import-a-new-environment)


Then build using [bit build](https://docs.bitsrc.io/docs/cli-build.html).

```bash
bit build
```

#### Usage - Configure
When you import a compiler component your bit.json file will contain an env entry as following:

```Typescript
{
    "env": {
        "compiler": "bit.test-envs/compilers/babel@0.0.9",
    }
    //...
}
```
In order to configure it we will need to change the compiler entry. The end result should look as following:

```Typescript
{
    "env": {
        "compiler": {
            "bit.test-envs/compilers/babel@0.0.9": {
                "files": {
                    ".babelrc": "./.babelrc"
                }
            }
        }
    }
}
```

- `compiler[name].files` - should contain a `.babelrc` entry as key with the path to your `babelrc`. Most commonly `.babelrc` file is in the project root.
- Path to `.babelrc` must be a json file.

### Ignore (non js files)
In case you have non js file which you don't want babel to compile but rather have access to when plugins apply. You should configure the ignore pattern. This way babel doesn't transform it and plugins get access. The compiler will also copy them to the dist folder.

Another way of doing this if you want to keep the babel ignore pattern is to use the `skipCompile` environment option:
```json
{
  "bit.test-envs/compilers/babel": {
    "rawConfig": {
      "skipCompile": [
        "**/*.flow"
      ]
    }
}
```
This has the same effect of having babel ignore these files while still placing them in the dist folder. This is good if you already have an existing ignore pattern you do not want changed.

`skipCompile` accepts glob patterns which it runs against the full path (in the author environment, where the component is exported) or the relative path (in the consumer environment, where the component is imported).
For this reason, it's recommended to just use file extensions (eg. `*.flow`) unless you're sure what you're doing. Also note that for this reason it's also recommended to prefix the patterns with a globstar (`**`) so their absolute or relative location would not affect the pattern matching.
