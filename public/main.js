import THREE from 'three';

import {
    Vector3,
    Scene,
    PerspectiveCamera,
    Color,
    Fog,
    HemisphereLight,
    MeshPhongMaterial,
    WebGLRenderer,
    Mesh,
    BoxBufferGeometry,
    BufferGeometry,
    Geometry,
    Float32BufferAttribute,
    BoxGeometry
} from 'three';

import {
    PointerLockControls
} from './PointerLockControls'


const scene = new Scene();
scene.background = new Color(0xcccccc);
scene.fog = new Fog(0xffffff, 0, 750)


const renderer = new WebGLRenderer({
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

const light = new HemisphereLight(0xeeeeff, 0x777788, 0.75);
light.position.set(0.5, 1, 0.75);
scene.add(light);
const controls = new PointerLockControls(camera);


const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
instructions.addEventListener('click', () => {
    controls.lock();
}, false);
controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});
controls.addEventListener('unlock', () => {
    blocker.style.display = 'block';
    instructions.style.display = '';
});


scene.add(controls.getObject());


window.addEventListener('resize', onWindowResize, false);


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}




let prevTime = performance.now();

const velocity = new Vector3();
const direction = new Vector3();

const move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
}


const onKeyDown = (event) => {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            move.forward = true;
            break;
        case 37: // left
        case 65: // a
            move.left = true;
            break;
        case 40: // down
        case 83: // s
            move.backward = true;
            break;
        case 39: // right
        case 68: // d
            move.right = true;
            break;
        case 32: // space
            move.up = true
            break;
        case 16: // shift
            move.down = true
            break;
    }
};
document.addEventListener('keydown', onKeyDown, false);
const onKeyUp = (event) => {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            move.forward = false;
            break;
        case 37: // left
        case 65: // a
            move.left = false;
            break;
        case 40: // down
        case 83: // s
            move.backward = false;
            break;
        case 39: // right
        case 68: // d
            move.right = false;
            break;
        case 32: // space
            move.up = false
            break;
        case 16: // shift
            move.down = false
            break;
    }
};
document.addEventListener('keyup', onKeyUp, false);

function animate(time) {
    requestAnimationFrame(animate);
    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= velocity.y * 10.0 * delta;
        direction.z = Number(move.forward) - Number(move.backward);
        direction.x = Number(move.left) - Number(move.right);
        direction.y = Number(move.down) - Number(move.up);
        direction.normalize(); // this ensures consistent movements in all directions
        if (move.forward || move.backward) velocity.z -= direction.z * 400.0 * delta;
        if (move.left || move.right) velocity.x -= direction.x * 400.0 * delta;
        if (move.up || move.down) velocity.y -= direction.y * 400.0 * delta;
        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY(velocity.y * delta);
        controls.getObject().translateZ(velocity.z * delta);
        prevTime = time;
    }
    renderer.render(scene, camera);
}


const boxGeometry = new BoxBufferGeometry(10, 10, 10);



function placeCube(x, y, z, c) {
    const boxMaterial = new MeshPhongMaterial({
        flatShading: true,
        color: 0xffffff
    });
    boxMaterial.color.setHSL(c / 255, 1, .5);

    const box = new Mesh(boxGeometry, boxMaterial);
    box.position.x = x * 10;
    box.position.y = y * 10;
    box.position.z = z * 10;
    box.updateMatrix();
    scene.add(box);
}


function placeChunk(a, offset_x = 0, offset_z = 0) {
    for (let x = 0; x < a.length; x++) {
        for (let y = 0; y < a[x].length; y++) {
            for (let z = 0; z < a[x][y].length; z++) {
                if (a[x][y][z]) placeCube(x + offset_x, z + offset_z, y, a[x][y][z]);
            }
        }
    }
}

function renderChunk(a) {
    const bufferGeometry = new BufferGeometry();
    const positions = [];
    const normals = [];
    const colors = [];
    const color = new Color(0xffffff);
    const boxGeometry = new BoxGeometry(10, 10, 10);
    const geometry = new Geometry();
    for (let x = 0; x < a.length; x++) {
        for (let y = 0; y < a[x].length; y++) {
            for (let z = 0; z < a[x][y].length; z++) {
                const c = a[x][y][z]
                if (!c) continue;
                geometry.copy(boxGeometry);
                geometry.translate(x, y, z);
                color.setHSL(c / 255, 1, .5);
                geometry.faces.forEach(face => {
                    positions.push(geometry.vertices[face.a].x);
                    positions.push(geometry.vertices[face.a].y);
                    positions.push(geometry.vertices[face.a].z);
                    positions.push(geometry.vertices[face.b].x);
                    positions.push(geometry.vertices[face.b].y);
                    positions.push(geometry.vertices[face.b].z);
                    positions.push(geometry.vertices[face.c].x);
                    positions.push(geometry.vertices[face.c].y);
                    positions.push(geometry.vertices[face.c].z);
                    normals.push(face.normal.x);
                    normals.push(face.normal.y);
                    normals.push(face.normal.z);
                    normals.push(face.normal.x);
                    normals.push(face.normal.y);
                    normals.push(face.normal.z);
                    normals.push(face.normal.x);
                    normals.push(face.normal.y);
                    normals.push(face.normal.z);
                    colors.push(color.r);
                    colors.push(color.g);
                    colors.push(color.b);
                    colors.push(color.r);
                    colors.push(color.g);
                    colors.push(color.b);
                    colors.push(color.r);
                    colors.push(color.g);
                    colors.push(color.b);
                });
            }
        }
    }
    bufferGeometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
    bufferGeometry.addAttribute('normal', new Float32BufferAttribute(normals, 3));
    bufferGeometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
    const material = new MeshPhongMaterial({
        flatShading: true,
    });
    const mesh = new Mesh(bufferGeometry, material);
    scene.add(mesh);
}

function placeChunks(chunks) {
    for (let chunk of chunks) {
        console.log(chunk.x)
        placeChunk(chunk.blocks, chunk.x, chunk.z)
    }
}

import {
    loadWorld
} from './chunk'

function init() {
    loadWorld(1541108087).then(chunks => {
        placeChunks(chunks)
    })

}

animate();
init();