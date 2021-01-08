export const sortObj = (obj,arr) => {
    var result = {}
    arr.map(name => {
        result[name] = obj[name]
    })
    return result
};