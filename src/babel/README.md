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

