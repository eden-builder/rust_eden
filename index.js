import crate from './src/lib.rs';

console.log(crate)



function loadWorld(id = 1541108087) {
    const reader = new FileReader();
    const ret = new Promise((res, err) => {
        reader.onloadend = e => res(e.target.result)
        reader.onerror = err
    })

    fetch(`http://files.edengame.net/${id}.eden`).then(r => r.blob()).then(b => reader.readAsArrayBuffer(b))
    return ret
}