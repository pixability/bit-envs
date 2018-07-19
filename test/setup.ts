import path from 'path'
import child_process from 'child_process'

function npmInstallFixture(){
    const baseFixturePath = path.resolve(__dirname, './fixtures/webpack')
    const cwd = process.cwd()
    process.chdir(baseFixturePath)
    child_process.execSync('npm i')
    process.chdir(cwd)
}
npmInstallFixture()
