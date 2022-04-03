const config = {
  width: 1200,
  height: 600,
  backgroundColor: 'black',
  type: Phaser.AUTO,
  parent: 'container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    {
      preload: preload,
      create: create,
      update: update,
      extend: {
        generateAsteroids: generateAsteroids,
        collideShipAsteroid: collideShipAsteroid,
      },
    },
  ],
};

const game = new Phaser.Game(config);

let ship;
let left;
let right;
let asteroids;
const lifeShip = 4;
const initBullets = 4;
const speedShip = 800;
const speedFall = 5;
const minAsteroids = 2;
const maxAsteroids = 4;
const appearTime = 600;

function preload() {
  this.load.image('ship', '../assets/sprites/ship.png');
  this.load.spritesheet('asteroids', '../assets/sprites/asteroids.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
}

function create() {
  ship = this.physics.add.sprite(
    game.config.width / 2,
    game.config.height - 100,
    'ship'
  );
  ship.setCollideWorldBounds(true);
  ship.life = lifeShip;
  ship.bullets = initBullets;

  asteroids = this.physics.add.group({
    defaultKey: 'asteroids',
    frame: 0,
    maxSise: 50,
  });

  this.time.addEvent({
    delay: appearTime,
    loop: true,
    callback: () => {
      this.generateAsteroids();
    },
  });

  this.physics.add.overlap(
    ship,
    asteroids,
    this.collideShipAsteroid,
    null,
    this
  );
  right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
}

function update() {
  Phaser.Actions.IncY(asteroids.getChildren(), speedFall);
  asteroids.children.iterate(function (asteroid) {
    if (asteroid.y > 600) {
      asteroids.killAndHide(asteroid);
    }
  });
  ship.body.setVelocityX(0);
  if (left.isDown) {
    ship.body.setVelocityX(-speedShip);
  } else if (right.isDown) {
    ship.body.setVelocityX(speedShip);
  }
}

function generateAsteroids() {
  let numAsteroids = Phaser.Math.Between(minAsteroids, maxAsteroids);
  for (let i = 0; i < numAsteroids; i++) {
    const asteroid = asteroids.get();

    if (asteroid) {
      asteroid.setActive(true).setVisible(true);
      asteroid.setFrame(Phaser.Math.Between(0, 1));
      asteroid.y = -100;
      asteroid.x = Phaser.Math.Between(0, game.config.width);
      this.physics.add.overlap(asteroid, asteroids, (asteroidInCollition) => {
        asteroidInCollition.x = Phaser.Math.Between(0, game.config.width);
      });
    }
  }
}

function collideShipAsteroid(ship, asteroid) {
  asteroids.killAndHide(asteroid);
  asteroid.setActive(false);
  asteroid.setVisible(false);
}
