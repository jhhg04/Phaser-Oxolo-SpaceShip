let ship;
let left;
let right;
let asteroids;
let text;
let bullets;
let energyBalls;
let spaceBar;
let shoot;
let damage;
let load_energy;
let iniciar;
const lifeShip = 4;
const initBullets = 4;
const speedShip = 800;
const speedFall = 5;
const minAsteroids = 2;
const maxAsteroids = 4;
const appearTime = 600;
const probabilityEnergy = 20;
const bulletsByEnergy = 4;
let time = {
  min: '00',
  seg: '00',
};
let timeLastGame = time;
let timeBestGame = time;

const Inicio = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Inicio() {
    Phaser.Scene.call(this, { key: 'Inicio' });
  },
  create() {
    time = {
      min: '00',
      seg: '00',
    };

    this.add.text(
      10,
      10,
      'Last Game: ' +
        timeLastGame.min +
        ':' +
        timeLastGame.seg +
        '\nBest Time: ' +
        timeBestGame.min +
        ':' +
        timeBestGame.seg,
      {
        fontSize: '20px',
        fill: '#ffffff',
      }
    );

    let texto = this.add
      .text(game.config.width / 2, game.config.height / 2, 'Press Enter', {
        fontSize: '40px',
        fill: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive();

    texto.on('pointerdown', () => {
      this.scene.start('Principal');
    });

    iniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    iniciar.reset();
  },
  update() {
    if (iniciar.isDown) {
      this.scene.start('Principal');
    }
  },
});

const Principal = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Principal() {
    Phaser.Scene.call(this, { key: 'Principal' });
  },
  preload() {
    this.load.image('ship', '../assets/sprites/ship.png');
    this.load.spritesheet('asteroids', '../assets/sprites/asteroids.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image('bullet', '../assets/sprites/bullet.png');
    this.load.image('energy', '../assets/sprites/energy.png');

    this.load.audio('shoot', '../assets/sounds/shoot.wav');
    this.load.audio('damage', '../assets/sounds/damage.wav');
    this.load.audio('load_energy', '../assets/sounds/load_energy.wav');
  },

  create() {
    ship = this.physics.add.sprite(
      game.config.width / 2,
      game.config.height - 100,
      'ship'
    );
    ship.setCollideWorldBounds(true);
    ship.life = lifeShip;
    ship.bullets = initBullets;

    shoot = this.sound.add('shoot');
    damage = this.sound.add('damage');
    load_energy = this.sound.add('load_energy');

    text = this.add
      .text(10, 10, '', {
        fontSize: '20px',
        fill: '#ffffff',
      })
      .setDepth(0.1);
    this.updateText();

    asteroids = this.physics.add.group({
      defaultKey: 'asteroids',
      frame: 0,
      maxSise: 50,
    });

    bullets = this.physics.add.group({
      classType: bullet,
      runChildUpdate: true,
      maxSise: 10,
    });

    energyBalls = this.physics.add.group({
      defaultKey: 'energy',
      maxSise: 20,
    });

    this.time.addEvent({
      delay: appearTime,
      loop: true,
      callback: () => {
        this.generateAsteroids();
      },
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.updateCounter();
      },
    });

    this.physics.add.overlap(
      ship,
      asteroids,
      this.collideShipAsteroid,
      null,
      this
    );

    this.physics.add.overlap(
      bullets,
      asteroids,
      this.collideBulletAsteroid,
      null,
      this
    );

    this.physics.add.overlap(
      ship,
      energyBalls,
      this.collideShipEnergy,
      null,
      this
    );

    right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    right.reset();
    left.reset();
  },

  update() {
    Phaser.Actions.IncY(asteroids.getChildren(), speedFall);
    asteroids.children.iterate(function (asteroid) {
      if (asteroid.y > 600) {
        asteroids.killAndHide(asteroid);
      }
    });

    Phaser.Actions.IncY(energyBalls.getChildren(), speedFall);
    energyBalls.children.iterate(function (energy) {
      if (energy.y > 600) {
        energyBalls.killAndHide(energy);
      }
    });

    ship.body.setVelocityX(0);
    if (left.isDown) {
      ship.body.setVelocityX(-speedShip);
    } else if (right.isDown) {
      ship.body.setVelocityX(speedShip);
    }

    if (Phaser.Input.Keyboard.JustDown(spaceBar) && ship.bullets > 0) {
      let bullet = bullets.get();
      if (bullet) {
        shoot.play();
        bullet.fire(ship.x, ship.y);
        ship.bullets--;
        this.updateText();
      }
    }
  },

  generateAsteroids() {
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

    let numberProbability = Phaser.Math.Between(1, 100);
    if (numberProbability <= probabilityEnergy) {
      const energy = energyBalls.get();

      if (energy) {
        energy.setActive(true).setVisible(true);
        energy.y = -100;
        energy.x = Phaser.Math.Between(0, game.config.width);
        this.physics.add.overlap(energy, asteroids, (energyInCollition) => {
          energyInCollition.x = Phaser.Math.Between(0, game.config.width);
        });
      }
    }
  },

  collideShipAsteroid(ship, asteroid) {
    if (asteroid.active) {
      asteroids.killAndHide(asteroid);
      asteroid.setActive(false);
      asteroid.setVisible(false);
      damage.play();
      if (ship.life > 0) {
        ship.life--;
        if (ship.life <= 0) {
          this.endGame();
        }
      }
      this.updateText();
    }
  },

  updateText() {
    text.setText(
      'Life: ' +
        ship.life +
        '\nBullets: ' +
        ship.bullets +
        '\nTime: ' +
        time.min +
        ':' +
        time.seg
    );
  },
  updateCounter() {
    time.seg++;
    time.seg = time.seg >= 10 ? time.seg : '0' + time.seg;
    if (time.seg >= 60) {
      time.seg = '00';
      time.min++;
      time.min = time.min >= 10 ? time.min : '0' + time.min;
    }
    this.updateText();
  },

  collideBulletAsteroid(bullet, asteroid) {
    if (bullet.active && asteroid.active) {
      bullets.killAndHide(bullet);
      bullet.setActive(false);
      bullet.setVisible(false);
      asteroids.killAndHide(asteroid);
      asteroid.setActive(false);
      asteroid.setVisible(false);
    }
  },

  collideShipEnergy(ship, energy) {
    if (energy.active) {
      energyBalls.killAndHide(energy);
      energy.setActive(false);
      energy.setVisible(false);
      load_energy.play();
      ship.bullets += bulletsByEnergy;
      this.updateText();
    }
  },
  endGame() {
    this.add
      .text(game.config.width / 2, game.config.height / 2, 'Game Over', {
        fontSize: '50px',
        fill: 'red',
      })
      .setOrigin(0.5);
    timeLastGame = time;
    let newTime = parseInt(time.min + time.seg);
    let bestTime = parseInt(timeBestGame.min + timeBestGame.seg);
    if (newTime > bestTime) {
      timeBestGame = time;
    }
    this.scene.pause();
    setTimeout(() => {
      this.scene.stop();
      this.scene.start('Inicio');
    }, 2000);
  },
});
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
  scene: [Inicio, Principal],
};

const game = new Phaser.Game(config);
