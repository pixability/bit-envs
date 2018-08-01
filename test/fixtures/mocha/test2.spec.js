import {expect} from 'chai'
import {add, sub} from './index'

describe('Top', function (){
    it('Layer 1', function() {
        expect(add(1, 1)).to.equal(2)
    })
    it('Layer 1 - should fail', function() {
        expect(sub(3, 1)).to.equal(3)
    })
    describe('Layer 2 - Top', function () {
        it('Layer 2', function() {
            expect(add(1, 1)).to.equal(2)
        })
        it('Layer 2 - should fail', function() {
            expect(sub(3, 1)).to.equal(3)
        })
        describe('Layer 3 - Top', function () {
            it('Layer 3', function() {
                expect(add(1, 1)).to.equal(2)
            })
            it('Layer 3 - should fail', function() {
                expect(sub(3, 1)).to.equal(3)
            })
        })
    })
})
