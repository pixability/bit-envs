function add(a, b) {
    return a + b
}
function sub(a, b) {
    return a - b
}

export function run(){
    return add(sub(1, 2), 1)
}
