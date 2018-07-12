import {expect} from 'chai'
import {add} from '../src'

describe('Babel', function () {
    it('compiler should transpile', function () {
        expect(add(3,4)).to.equal(7)
    })
})