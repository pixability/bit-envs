import {expect} from 'chai'
import {run} from './index'

describe('basic', function (){
    it('should add properly', function() {
        expect(run()).to.equal(0)
    })
})
