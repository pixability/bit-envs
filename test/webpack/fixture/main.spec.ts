import { add } from './add'
import { expect } from 'chai'

describe('webpack test bundle', function () {
  expect(add(1, 1)).to.equal(2)
})
