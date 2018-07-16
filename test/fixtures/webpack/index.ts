import {add} from './add'
import {sub} from './sub'

// console.log(add(sub(1,2),1))

export function run() {
    return add(sub(1,2),1)
}