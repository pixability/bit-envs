import {add} from './add'
import {sub} from './sub'
export {add}
export {sub}

export function run() {
    return add(sub(1,2),1)
}


