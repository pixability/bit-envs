const assert = require('assert')
const sum = require('./sum')

describe('adds 1 + 2 to equal 3', () => {
  it('should add', () => {
    assert(sum(1, 2), 3)
  })
})
