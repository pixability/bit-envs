import path from 'path'
import child_process from 'child_process'
import fs from 'fs'
function npmInstallFixture() {
    const baseFixturePath = path.resolve(__dirname, './fixtures')
    fs.readdirSync(baseFixturePath).forEach(function(name){
        const fixutrePath = path.resolve(baseFixturePath, name)
        if (fs.lstatSync(fixutrePath).isDirectory()) {
            const cwd = process.cwd()
            process.chdir(fixutrePath)
            child_process.execSync('npm i')
            process.chdir(cwd)
        }
    })
}
npmInstallFixture()
