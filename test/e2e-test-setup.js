const tape = require('tape')
const mixedTape = require('mixed-tape')
const test = mixedTape(tape)
const compose = require('docker-compose')
const relsym = require('relsym')
const commandExists = require('command-exists').sync

const loginToken = process.env.LOGIN_TOKEN

async function execInContainer(container, cmds, fixtureFolder, log) {
  let results = []
  for (let i = 0; i < cmds.length; i++) {
    const command = cmds[i]
    const { out } = await compose.exec(
      container, command, {cwd: fixtureFolder, log}
    )
    results.push(out)
  }
  return results
}

module.exports = {
  test,
  async startup (fixtureFolder, log = false) {
    const allCmdsExist = commandExists('docker') && commandExists('docker-compose')
    if (!loginToken) {
      throw new Error(
        'please include a bit login token as the LOGIN_TOKEN environment variable'
      )
    }
    if (!allCmdsExist) {
      throw new Error('please install docker and docker-compose to run tests')
    }
    relsym(`${__dirname}/../.git/bit`)
    await compose.upAll({ cwd: fixtureFolder, log })
    return {
      loginToken,
      runInPublisher: cmds => execInContainer('scope', cmds, fixtureFolder, log),
      runInAuthor: cmds => execInContainer('author', cmds, fixtureFolder, log),
      runInConsumer: cmds => execInContainer('consumer', cmds, fixtureFolder, log)
    }
  },
  async cleanup (fixtureFolder, log = false) {
    await compose.kill({ cwd: fixtureFolder, log })
    await compose.rm({ cwd: fixtureFolder, log })
  }
}

