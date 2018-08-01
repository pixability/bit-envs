import path from 'path'
import child_process from 'child_process'
import fs from 'fs-extra'
function npmInstallFixture() {
    const baseFixturePath = path.resolve(__dirname, './fixtures')
    fs.readdirSync(baseFixturePath).forEach(function(name){
        const fixturePath = path.resolve(baseFixturePath, name)
        if (fs.lstatSync(fixturePath).isDirectory() &&
            !fs.existsSync(path.resolve(fixturePath, '.npm-skip')))  {
            const cwd = process.cwd()
            process.chdir(fixturePath)
            child_process.execSync('npm i')
            process.chdir(cwd)
        }
    })
}
if (!process.env['NO_INSTALL']) {
    npmInstallFixture()
}

