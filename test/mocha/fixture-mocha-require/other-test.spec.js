import {expect} from 'chai'
import {run} from './index'

describe('other', function (){
  it('should preload files', function() {
    expect(global.mochaSetupTestRun).to.equal(true)
  })
})
