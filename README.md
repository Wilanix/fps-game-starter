import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ec9ff);
scene.fog = new THREE.Fog(0x8ec9ff, 18, 70);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const keys = {};
const worldBounds = 24;
const floorSize = 80;

const hud = {
  health: document.getElementById('health'),
  score: document.getElementById('score'),
  weaponName: document.getElementById('weapon-name'),
  ammo: document.getElementById('ammo-text'),
  rarity: document.getElementById('weapon-rarity'),
  message: document.getElementById('message'),
  deathScreen: document.getElementById('death-screen'),
  finalScore: document.getElementById('final-score'),
  restartBtn: document.getElementById('restart-btn'),
};

const state = {
  started: false,
  dead: false,
  score: 0,
  health: 100,
  canShoot: true,
  shootTimer: 0,
  reloadTimer: 0,
  selectedWeapon: 0,
  latestEnemyHit: null,
  spawnCoolDown: 0,
};

const weapons = [
  {
    name: 'Pistolet',
    rarity: 'common',
    label: 'Commun',
    damage: 18,
    fireRate: 0.28,
    clipSize: 12,
    reserveAmmo: 60,
    currentAmmo: 12,
    reloadTime: 1.2,
    color: 0xdfe4ea,
  },
  {
    name: 'Carabine cactus',
    rarity: 'uncommon',
    label: 'Peu commun',
    damage: 26,
    fireRate: 0.18,
    clipSize: 18,
    reserveAmmo: 72,
    currentAmmo: 18,
    reloadTime: 1.5,
    color: 0x7ef3a6,
  },
  {
    name: 'Blaster réacteur',
    rarity: 'rare',
    label: 'Rare',
    damage: 36,
    fireRate: 0.14,
    clipSize: 15,
    reserveAmmo: 60,
    currentAmmo: 15,
    reloadTime: 1.8,
    color: 0x81c8ff,
  },
  {
    name: 'Mini-gun',
    rarity: 'epic',
    label: 'Épique',
    damage: 52,
    fireRate: 0.09,
    clipSize: 30,
    reserveAmmo: 120,
    currentAmmo: 30,
    reloadTime: 2.1,
    color: 0xd3a6ff,
  },
  {
    name: 'Fusil du soleil',
    rarity: 'legendary',
    label: 'Légendaire',
    damage: 88,
    fireRate: 0.12,
    clipSize: 8,
    reserveAmmo: 32,
    currentAmmo: 8,
    reloadTime: 2.3,
    color: 0xffcf6d,
  },
];

const player = {
  height: 1.6,
  speed: 8,
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  position: new THREE.Vector3(0, 1.6, 12),
  lookDirection: new THREE.Vector3(0, 0, -1),
};

const enemyData = [];
const otherMeshes = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setMessage(text) {
  hud.message.textContent = text;
}

function updateHUD() {
  const weapon = weapons[state.selectedWeapon];
  hud.health.textContent = Math.max(0, Math.round(state.health));
  hud.score.textContent = state.score;
  hud.weaponName.textContent = weapon.name;
  hud.ammo.textContent = `${weapon.currentAmmo} / ${weapon.reserveAmmo}`;
  hud.rarity.textContent = weapon.label;
  hud.rarity.className = `panel rarity-${weapon.rarity}`;
}

function resetWeaponAmmo(weapon) {
  weapon.currentAmmo = weapon.clipSize;
  weapon.reserveAmmo = weapon.reserveAmmo || weapon.clipSize * 4;
}

function switchWeapon(index) {
  if (index < 0 || index >= weapons.length || state.dead) return;
  const weapon = weapons[index];
  state.selectedWeapon = index;
  state.reloadTimer = 0;
  state.canShoot = true;
  updateHUD();
  setMessage(`${weapon.name} prête`);
}

function createGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(floorSize, floorSize),
    new THREE.MeshStandardMaterial({
      color: 0x7ec857,
      roughness: 0.9,
      metalness: 0.1,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  const border = new THREE.Mesh(
    new THREE.RingGeometry(24, 27, 64),
    new THREE.MeshStandardMaterial({
      color: 0xcab77d,
      side: THREE.DoubleSide,
    })
  );
  border.rotation.x = -Math.PI / 2;
  border.position.y = 0.02;
  scene.add(border);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xbfe7ff, side: THREE.BackSide })
  );
  scene.add(sky);
}

function createSun() {
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd76a })
  );
  sun.position.set(18, 16, -25);
  scene.add(sun);
}

function createTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 2.3 * scale, 12),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
  trunk.position.set(x, 1.15 * scale, z);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.2 * scale, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x4caf50 })
  );
  leaves.position.set(x, 2.8 * scale, z);

  scene.add(trunk, leaves);
  otherMeshes.push(trunk, leaves);
}

function createRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1 * scale, 0),
    new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 1 })
  );
  rock.position.set(x, 0.8 * scale, z);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  scene.add(rock);
  otherMeshes.push(rock);
}

function createHouse(x, z, width = 4, depth = 3) {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, 2.3, depth),
    new THREE.MeshStandardMaterial({ color: 0xf4d2a6 })
  );
  base.position.set(x, 1.15, z);
  scene.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 1.5, 4),
    new THREE.MeshStandardMaterial({ color: 0xd7655d })
  );
  roof.position.set(x, 3.2, z);
  roof.rotation.y = Math.PI / 4;
  scene.add(roof);

  for (let i = 0; i < 3; i++) {
    const windowMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xfff0a8, emissive: 0x9d7d00, emissiveIntensity: 0.5 })
    );
    windowMesh.position.set(x - width * 0.2 + i * (width * 0.25), 1.5, z + depth * 0.52);
    scene.add(windowMesh);
    otherMeshes.push(windowMesh);
  }

  otherMeshes.push(base, roof);
}

function createWorldDecor() {
  const decorItems = [
    { type: 'tree', x: -12, z: -5, scale: 1.1 },
    { type: 'tree', x: 17, z: 8, scale: 0.9 },
    { type: 'tree', x: -20, z: 12, scale: 1.2 },
    { type: 'tree', x: 19, z: -16, scale: 1.1 },
    { type: 'tree', x: -8, z: 19, scale: 0.8 },
    { type: 'tree', x: 8, z: 22, scale: 1 },
    { type: 'rock', x: -9, z: 10, scale: 1 },
    { type: 'rock', x: 13, z: 16, scale: 1.4 },
    { type: 'rock', x: -15, z: -17, scale: 1.2 },
    { type: 'rock', x: 20, z: -8, scale: 1 },
    { type: 'house', x: -10, z: -18, width: 5, depth: 4 },
    { type: 'house', x: 14, z: -12, width: 5, depth: 4 },
    { type: 'house', x: 8, z: 12, width: 4.5, depth: 4 },
  ];

  for (const item of decorItems) {
    if (item.type === 'tree') createTree(item.x, item.z, item.scale);
    if (item.type === 'rock') createRock(item.x, item.z, item.scale);
    if (item.type === 'house') createHouse(item.x, item.z, item.width, item.depth);
  }
}

function createEnemy(position) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.1, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c })
  );
  body.position.y = 1.1;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf7d7a6 })
  );
  head.position.y = 2.1;
  group.add(head);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1d1d1d });
  const eyeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), eyeMat);
  const eyeRight = eyeLeft.clone();
  eyeLeft.position.set(-0.12, 2.12, 0.4);
  eyeRight.position.set(0.12, 2.12, 0.4);
  group.add(eyeLeft, eyeRight);

  group.position.copy(position);
  scene.add(group);

  const enemy = {
    group,
    health: 100,
    speed: 1.8 + Math.random() * 1.2,
    attackCooldown: 0,
    hitFlash: 0,
    alive: true,
    radius: 1.1,
  };

  enemyData.push(enemy);
  return enemy;
}

function spawnEnemies() {
  const spawnPositions = [
    new THREE.Vector3(-12, 0, 0),
    new THREE.Vector3(14, 0, 5),
    new THREE.Vector3(0, 0, -15),
    new THREE.Vector3(-18, 0, 18),
    new THREE.Vector3(18, 0, -18),
    new THREE.Vector3(-6, 0, 22),
    new THREE.Vector3(12, 0, 18),
    new THREE.Vector3(-20, 0, -8),
  ];

  for (const pos of spawnPositions) {
    createEnemy(pos);
  }
}

function initLighting() {
  const hemi = new THREE.HemisphereLight(0xdff6ff, 0x4b7d3b, 1.2);
  scene.add(hemi);

  const sunLight = new THREE.DirectionalLight(0xfff5bf, 1.2);
  sunLight.position.set(12, 20, 8);
  scene.add(sunLight);
}

function onPointerLockChange() {
  if (document.pointerLockElement === renderer.domElement) {
    if (!state.started && !state.dead) {
      state.started = true;
      setMessage('Zone de combat activée');
    }
  }
}

function handlePointerMove(event) {
  if (document.pointerLockElement !== renderer.domElement) return;

  player.yaw -= event.movementX * 0.0022;
  player.pitch -= event.movementY * 0.0018;
  player.pitch = clamp(player.pitch, -1.35, 1.35);
}

function handleKeyState() {
  if (state.dead) return;

  const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const move = new THREE.Vector3();

  if (keys['KeyW']) move.add(forward);
  if (keys['KeyS']) move.sub(forward);
  if (keys['KeyA']) move.sub(right);
  if (keys['KeyD']) move.add(right);

  if (move.lengthSq() > 0) {
    move.normalize();
    const speed = player.speed * clock.getDelta();
    player.position.x += move.x * speed;
    player.position.z += move.z * speed;
    player.position.x = clamp(player.position.x, -worldBounds, worldBounds);
    player.position.z = clamp(player.position.z, -worldBounds, worldBounds);
  }

  const dir = new THREE.Vector3();
  dir.x = Math.sin(player.yaw) * Math.cos(player.pitch);
  dir.y = Math.sin(player.pitch);
  dir.z = Math.cos(player.yaw) * Math.cos(player.pitch);
  player.lookDirection.copy(dir).normalize();

  camera.position.set(player.position.x, player.position.y, player.position.z);
  camera.rotation.set(player.pitch, player.yaw, 0);
}

function getCurrentWeapon() {
  return weapons[state.selectedWeapon];
}

function setReloadingState() {
  const weapon = getCurrentWeapon();
  if (weapon.currentAmmo > 0 || state.reloadTimer > 0) return;
  if (weapon.reserveAmmo <= 0) {
    setMessage('Aucune munition restante');
    return;
  }

  state.reloadTimer = weapon.reloadTime;
  setMessage(`${weapon.name} : rechargement...`);
}

function tryShoot() {
  if (!state.started || state.dead) return;

  const weapon = getCurrentWeapon();
  if (state.reloadTimer > 0) {
    return;
  }

  if (weapon.currentAmmo <= 0) {
    setMessage('Recharge !');
    return;
  }

  if (state.shootTimer > 0) return;

  weapon.currentAmmo -= 1;
  state.shootTimer = weapon.fireRate;

  raycaster.setFromCamera(mouse, camera);
  const hitTargets = [];

  for (const enemy of enemyData) {
    if (!enemy.alive) continue;
    hitTargets.push(enemy.group);
  }

  const intersections = raycaster.intersectObjects(hitTargets, true);
  let hitEnemy = null;

  if (intersections.length > 0) {
    const parent = intersections[0].object.parent;
    hitEnemy = enemyData.find((enemy) => enemy.group === parent || enemy.group.children.includes(intersections[0].object));
  }

  if (hitEnemy) {
    hitEnemy.health -= weapon.damage;
    hitEnemy.hitFlash = 0.15;
    if (hitEnemy.health <= 0) {
      hitEnemy.alive = false;
      hitEnemy.group.visible = false;
      state.score += 10;
      setMessage('Bot éliminé !');
    } else {
      setMessage(`Touché ! ${hitEnemy.health} HP`);
    }
  } else {
    setMessage(`${weapon.name} : tir`);
  }

  updateHUD();
}

function updateAmmoAndReload(delta) {
  const weapon = getCurrentWeapon();

  if (state.shootTimer > 0) {
    state.shootTimer -= delta;
    if (state.shootTimer < 0) state.shootTimer = 0;
  }

  if (state.reloadTimer > 0) {
    state.reloadTimer -= delta;
    if (state.reloadTimer <= 0) {
      const needed = weapon.clipSize - weapon.currentAmmo;
      const taken = Math.min(needed, weapon.reserveAmmo);
      weapon.currentAmmo += taken;
      weapon.reserveAmmo -= taken;
      state.reloadTimer = 0;
      setMessage(`${weapon.name} rechargée`);
      updateHUD();
    }
  }

  if (weapon.currentAmmo <= 0 && weapon.reserveAmmo > 0 && state.reloadTimer <= 0 && state.started) {
    setReloadingState();
  }
}

function updateBots(delta) {
  for (const enemy of enemyData) {
    if (!enemy.alive) continue;

    const toPlayer = new THREE.Vector3().subVectors(player.position, enemy.group.position);
    const dist = toPlayer.length();
    toPlayer.normalize();

    if (dist > 0.1) {
      enemy.group.position.addScaledVector(toPlayer, enemy.speed * delta);
      enemy.group.lookAt(player.position.x, enemy.group.position.y, player.position.z);
    }

    if (dist < 1.4) {
      enemy.attackCooldown -= delta;
      if (enemy.attackCooldown <= 0) {
        state.health = Math.max(0, state.health - (6 + Math.random() * 6));
        enemy.attackCooldown = 1.1;
        setMessage('Tu es touché !');
        updateHUD();

        if (state.health <= 0) {
          triggerGameOver();
          return;
        }
      }
    }

    if (enemy.hitFlash > 0) {
      enemy.hitFlash -= delta;
      const bodyMaterial = enemy.group.children[0].material;
      bodyMaterial.emissive = new THREE.Color(0xff4444);
      bodyMaterial.emissiveIntensity = enemy.hitFlash * 4;
    } else {
      const bodyMaterial = enemy.group.children[0].material;
      bodyMaterial.emissive = new THREE.Color(0x000000);
      bodyMaterial.emissiveIntensity = 0;
    }
  }
}

function triggerGameOver() {
  state.dead = true;
  hud.deathScreen.classList.remove('hidden');
  hud.finalScore.textContent = `Score final : ${state.score}`;
  document.exitPointerLock();
}

function restartGame() {
  state.dead = false;
  state.started = false;
  state.score = 0;
  state.health = 100;
  player.position.set(0, 1.6, 12);
  player.yaw = 0;
  player.pitch = 0;
  camera.position.set(player.position.x, player.position.y, player.position.z);
  camera.rotation.set(0, 0, 0);

  for (const enemy of enemyData) {
    enemy.alive = true;
    enemy.health = 100;
    enemy.group.visible = true;
    enemy.group.position.set(
      (Math.random() - 0.5) * 30,
      0,
      (Math.random() - 0.5) * 30
    );
  }

  for (const weapon of weapons) {
    weapon.currentAmmo = weapon.clipSize;
    weapon.reserveAmmo = weapon.clipSize * 4;
  }

  hud.deathScreen.classList.add('hidden');
  updateHUD();
  setMessage('Nouvelle partie');
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  handleKeyState();
  updateAmmoAndReload(delta);
  updateBots(delta);
  renderer.render(scene, camera);
}

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;

  if (event.code === 'Digit1') switchWeapon(0);
  if (event.code === 'Digit2') switchWeapon(1);
  if (event.code === 'Digit3') switchWeapon(2);
  if (event.code === 'Digit4') switchWeapon(3);
  if (event.code === 'Digit5') switchWeapon(4);
  if (event.code === 'KeyR') setReloadingState();
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

window.addEventListener('pointerdown', (event) => {
  if (state.dead) return;

  if (document.pointerLockElement !== renderer.domElement) {
    renderer.domElement.requestPointerLock();
    return;
  }

  tryShoot();
});

window.addEventListener('mousedown', (event) => {
  if (event.button === 0 && !state.dead && document.pointerLockElement === renderer.domElement) {
    tryShoot();
  }
});

window.addEventListener('mousemove', handlePointerMove);
document.addEventListener('pointerlockchange', onPointerLockChange);
window.addEventListener('resize', handleWindowResize);
hud.restartBtn.addEventListener('click', restartGame);

createGround();
createSun();
createWorldDecor();
initLighting();
spawnEnemies();
updateHUD();
setMessage('Cliquez pour commencer');

for (const weapon of weapons) {
  weapon.currentAmmo = weapon.clipSize;
  weapon.reserveAmmo = weapon.clipSize * 4;
}

camera.position.copy(player.position);
animate();

setInterval(() => {
  if (!state.dead && state.started) {
    const weapon = getCurrentWeapon();
    if (weapon.currentAmmo <= 0 && weapon.reserveAmmo > 0 && state.reloadTimer <= 0) {
      setReloadingState();
    }
  }
}, 120);
