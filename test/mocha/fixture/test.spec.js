import {expect} from 'chai'
import {run} from './index'

describe('basic', function (){
    it('should add properly', function() {
        expect(run()).to.equal(0)
    })
    it('should preload a file specified with `filesRequire` in the config', function() {
        expect(global.mochaSetupTestRun).to.equal(true)
    })
})
