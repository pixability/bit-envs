const {expect} = require('chai')
const {run} = require('./index')

describe('other', function (){
    it('should add properly', function() {
        expect(run()).to.equal(0)
    })
})
