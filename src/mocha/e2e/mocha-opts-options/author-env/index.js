const {add} = require('./add')
const {sub} = require('./sub')

module.exports = {
  run() {
    return add(sub(1,2),1)
  }
}
