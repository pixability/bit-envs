const { expect } = require('chai')
const { run, add, sub } = require('../index')

describe('basic', function () {
  it('should add/sub properly', function () {
    expect(run()).to.equal(0)
  })
  it('add', function () {
    expect(add(1, 1)).to.equal(2)
  })
  it('sub', function () {
    expect(sub(3, 1)).to.equal(2)
  })
  it('did not use local config', function () {
    // setup file not preloaded
    expect(global.jestSetupFilesRun).to.equal(undefined)
  })
})
