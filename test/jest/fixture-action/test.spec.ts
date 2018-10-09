import {expect} from 'chai'
import {run, add, sub} from './index'

describe('basic', function (){
    it('should add/sub properly', function() {
        expect(run()).to.equal(0)
    })
    it('add', function() {
        expect(add(1, 1)).to.equal(2)
    })
    it('sub', function() {
        expect(sub(3, 1)).to.equal(2)
    })
    it('supports preloading files with the jest `setupFiles` field', function() {
        expect(global.jestSetupFilesRun).to.equal(true)
    })
})
