export function loadWorld(id) {
    console.log(`Getting http://127.0.0.1:8080/world/${id}`)
    return fetch(`http://127.0.0.1:8080/world/${id}`).then(res => res.json())
}