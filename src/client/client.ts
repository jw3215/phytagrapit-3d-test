import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { io } from "socket.io-client"

const scene = new THREE.Scene()

scene.background = new THREE.Color(0xeeeeee)
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// )
const camera = new THREE.OrthographicCamera()
camera.zoom = 0.4
camera.position.x = 5
camera.position.y = 5
camera.position.z = 5
camera.lookAt(new THREE.Vector3(0, 0, 0))

const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })
const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })

const xAxisPoints = []
xAxisPoints.push(new THREE.Vector3(-3, 0, 0))
xAxisPoints.push(new THREE.Vector3(3, 0, 0))

const yAxisPoints = []
yAxisPoints.push(new THREE.Vector3(0, -3, 0))
yAxisPoints.push(new THREE.Vector3(0, 3, 0))

const zAxisPoints = []
zAxisPoints.push(new THREE.Vector3(0, 0, -3))
zAxisPoints.push(new THREE.Vector3(0, 0, 3))

const xAxisLineGeometry = new THREE.BufferGeometry().setFromPoints(xAxisPoints)
const directionConeGeometry = new THREE.ConeGeometry(0.1, 0.4)
const yAxisLineGeometry = new THREE.BufferGeometry().setFromPoints(yAxisPoints)
const zAxisLineGeometry = new THREE.BufferGeometry().setFromPoints(zAxisPoints)

const xAxisLine = new THREE.Line(xAxisLineGeometry, xAxisMaterial)
const xAxisCone = new THREE.Mesh(directionConeGeometry, xAxisMaterial)
const yAxisLine = new THREE.Line(yAxisLineGeometry, yAxisMaterial)
const yAxisCone = new THREE.Mesh(directionConeGeometry, yAxisMaterial)
const zAxisLine = new THREE.Line(zAxisLineGeometry, zAxisMaterial)
const zAxisCone = new THREE.Mesh(directionConeGeometry, zAxisMaterial)

xAxisCone.rotation.z = - Math.PI / 2
xAxisCone.position.x += 3

yAxisCone.position.y += 3

zAxisCone.rotation.x = Math.PI / 2
zAxisCone.position.z += 3

scene.add(xAxisLine)
scene.add(xAxisCone)
scene.add(yAxisLine)
scene.add(yAxisCone)
scene.add(zAxisLine)
scene.add(zAxisCone)

// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(-1, 2, 4)

// set its position
// light.position.x = 10;
// light.position.y = 50;
// light.position.z = 130;

// scene.add(light)

const renderer = new THREE.WebGLRenderer()

// renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setSize(400, 400)
document.body.appendChild(renderer.domElement)

const incButton = document.createElement('button')
incButton.id = "incButton"
incButton.textContent = 'inc'

const decButton = document.createElement('button')
decButton.id = "incButton"
decButton.textContent = 'dec'

document.body.appendChild(incButton)
document.body.appendChild(decButton)

const controls = new OrbitControls(camera, renderer.domElement)

const sphereGeometry = new THREE.SphereGeometry(0.8, 40, 40)
const boxMaterial = new THREE.MeshLambertMaterial({
  color: 0xff9999,
  // wireframe: true,
})

incButton.addEventListener('click', () => {
  console.log('inc')
  sphereGeometry.scale(1.2, 1.2, 1.2)
  render()
})


decButton.addEventListener('click', () => {
  console.log('dec')
  sphereGeometry.scale(1 / 1.2, 1 / 1.2, 1 / 1.2)
  render()
})

const sphere = new THREE.Mesh(sphereGeometry, boxMaterial)
sphere.position.set(1, 0.3, 1)

scene.add(sphere)

const lineGeometry = new THREE.CylinderGeometry(0.01, 0.01, 10)
// const lineGeometry = new THREE.CylinderGeometry()
const lineMaterial = new THREE.MeshPhongMaterial({
  color: 0x333333,
  // wireframe: true,
})

const line = new THREE.Mesh(lineGeometry, lineMaterial)
line.position.set(0.5, 0.5, 0)
line.rotation.set(1, 1, 1)
scene.add(line)

let myId = ''
const socket = io()
socket.on('connect', () => {
  console.log('connect', myId)
})

socket.on('id', (id) => {
  myId = id
  console.log('myid', myId)
})


socket.on('updateCamera', (data) => {
  if (data.id !== myId) {
    camera.position.copy(data.position)
    camera.rotation.copy(data.rotation)
    camera.zoom = data.zoom
  }

  render()
})

incButton.addEventListener('click', () => {
  socket.emit('sphereChange', myId, "inc")
})

decButton.addEventListener('click', () => {
  socket.emit('sphereChange', myId, "dec")
})

socket.on('updateSphere', (id, data) => {
  if (id === myId) return
  if (data === "inc") {
    sphereGeometry.scale(1.2, 1.2, 1.2)
  } else {
    sphereGeometry.scale(1 / 1.2, 1 / 1.2, 1 / 1.2)
  }

  render()
})



controls.addEventListener('change', () => {
  const data = {
    id: myId,
    position: camera.position,
    rotation: camera.rotation,
    zoom: camera.zoom,
  }

  socket.emit('cameraChange', data)
  render()
})


const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(0, 10, 0);
light.target.position.set(0, 0, 0);

function setupLight() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  createPointLight({ x: 10, y: 30, z: 10 });
  createPointLight({ x: -10, y: 30, z: -10 });
  createPointLight({ x: -10, y: 30, z: 10 });
  createPointLight({ x: 10, y: 30, z: -10 });

  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
  shadowLight.position.set(0, 10, 0);
  shadowLight.target.position.set(0, 0, 0);

  // scene.add(shadowLight);
  scene.add(shadowLight.target);

  shadowLight.castShadow = true;

  shadowLight.shadow.mapSize.width = 1024 * 2;
  shadowLight.shadow.mapSize.height = 1024 * 2;

  let d = 11;
  shadowLight.shadow.camera.left = -d;
  shadowLight.shadow.camera.right = d;
  shadowLight.shadow.camera.top = d;
  shadowLight.shadow.camera.bottom = -d;

  shadowLight.shadow.camera.near = 3;
  shadowLight.shadow.camera.far = 12;
}

function createPointLight(pos: any) {
  const light = new THREE.PointLight(0xffffff, 0.4);
  light.position.set(pos.x, pos.y, pos.z);
  scene.add(light);
}

setupLight()

// window.addEventListener('resize', onWindowResize, false)
// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight
//   renderer.setSize(window.innerWidth, window.innerHeight)
//   render()
// }

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  render()
}

function render() {
  camera.updateProjectionMatrix()
  renderer.render(scene, camera)
}

// animate()
render()

function updateLightPosition() {
  light.position.copy(camera.position);
  // console.dir(light.position)
  // light.position.x += 0.5
  // light.position.y += 0.5
  // light.position.z += 5
}