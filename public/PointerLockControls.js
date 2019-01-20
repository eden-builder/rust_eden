import {
	Object3D,
	Vector3,
	Euler,
	EventDispatcher
} from 'three';

const PI_2 = Math.PI / 2;

const onPointerlockError = () => {
	console.error('PointerLockControls: Unable to use Pointer Lock API');
}

export class PointerLockControls extends EventDispatcher {
	constructor(camera, domElement = document.body) {
		super();
		this.domElement = domElement;
		this.isLocked = false;
		camera.rotation.set(0, 0, 0);
		this.pitchObject = new Object3D();
		this.pitchObject.add(camera);
		this.yawObject = new Object3D();
		this.yawObject.position.y = 10;
		this.yawObject.add(this.pitchObject);

		this.onMouseMove = (event) => {
			if (this.isLocked === false) return;
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			this.yawObject.rotation.y -= movementX * 0.002;
			this.pitchObject.rotation.x -= movementY * 0.002;
			this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));

		}

		this.onPointerlockChange = () => {
			if (document.pointerLockElement === this.domElement) {
				this.dispatchEvent({
					type: 'lock'
				});
				this.isLocked = true;
			} else {
				this.dispatchEvent({
					type: 'unlock'
				});
				this.isLocked = false;
			}
		}
		this.connect()
	}

	connect() {
		document.addEventListener('mousemove', this.onMouseMove, false);
		document.addEventListener('pointerlockchange', this.onPointerlockChange, false);
		document.addEventListener('pointerlockerror', onPointerlockError, false);
	};

	disconnect() {
		document.removeEventListener('mousemove', this.onMouseMove, false);
		document.removeEventListener('pointerlockchange', this.onPointerlockChange, false);
		document.removeEventListener('pointerlockerror', onPointerlockError, false);
	};

	dispose() {
		this.disconnect();
	};

	getObject() {
		return this.yawObject;
	};

	getDirection() {
		var direction = new Vector3(0, 0, -1);
		var rotation = new Euler(0, 0, 0, 'YXZ');
		return (v) => {
			rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
			v.copy(direction).applyEuler(rotation);
			return v;
		};
	}

	lock() {
		this.domElement.requestPointerLock();
	}

	unlock() {
		document.exitPointerLock();
	}
};