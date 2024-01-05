var asteroids, cursors, spaceship, thruster, stars, thrustForce;
var offsetX, offsetY, targetAngle;
var rotationSpeed = 0.05;
var mapWidth = 8000;
var mapHeight = 8000;
var isMouseDown = false;
var isRotatingToMouse = false;
const maxGravitationalRange = 200;
const G = 12000;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true,
            setBounds: {
                x: 0,
                y: 0,
                width: mapWidth,
                height: mapHeight,
                thickness: 32
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'static/assets/images/background.png');
    this.load.image('spaceship', 'static/assets/images/spaceship.png');
    this.load.image('asteroid', 'static/assets/images/asteroid.png');
    this.load.image('star', 'static/assets/images/star.png');
    this.load.image('particle', 'static/assets/images/particle.png'); 
    for (let i = 1; i <= 10; i++) {
        this.load.image('thruster_' + i, 'static/assets/images/thruster_' + i + '.png');
    }
}

function create() {
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight)
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    let originalWidth = 187; // Replace with actual width
    let originalHeight = 528 * 0.79; // 79% of the height
    let spaceshipScale = 0.15
    let hitboxWidth = originalWidth * 0.5 * spaceshipScale; // Half of the width, scaled
    let hitboxHeight = originalHeight * spaceshipScale;

    // Calculate offsets for the hitbox
    offsetX = originalWidth * 0.25 * spaceshipScale; // Starting from 1/4 width, scaled
    offsetY = 0; // Top of the image

    spaceship = this.add.sprite(0, 0, 'spaceship').setScale(spaceshipScale);
    thruster = this.add.sprite(0, 20, 'thruster_1').setScale(spaceshipScale);
    thruster.setVisible(false);

    spaceshipContainer = this.add.container(config.width / 2, config.height / 2, [spaceship, thruster]);
    this.physics.world.enable(spaceshipContainer);

    // Ensure the body is created before setting size and offset
    if (spaceshipContainer.body) {
        spaceshipContainer.body.setSize(hitboxWidth, hitboxHeight);
        spaceshipContainer.body.setOffset(offsetX, offsetY);
        spaceshipContainer.body.setCollideWorldBounds(true);
        spaceshipContainer.body.setDrag(0.99);
    } 
    
    var starCount = mapWidth / 250;
    var graphics = this.add.graphics(); 
    stars = this.physics.add.group();
    asteroids = this.physics.add.group();

    for (let i = 0; i < starCount; i++) {
        let x = Phaser.Math.Between(0, mapWidth);
        let y = Phaser.Math.Between(0, mapHeight);

        // Randomly choose the type of the star
        let starType = Phaser.Math.Between(1, 3); // 1, 2, or 3
        let starScale = 0.1;
        let gravitationalRange, gravitationalStrength, color;

        switch(starType) {
            case 1: // Type 1: Larger area, weaker strength
                gravitationalRange = maxGravitationalRange * 2;
                gravitationalStrength = G * 0.5;
                color = 0x00ff00; // Green
                break;
            case 2: // Type 2: Middle option (original)
                gravitationalRange = maxGravitationalRange;
                gravitationalStrength = G;
                color = 0xffff00; // Yellow
                break;
            case 3: // Type 3: Smaller area, stronger strength
                gravitationalRange = maxGravitationalRange * 1.5;
                gravitationalStrength = G * 2;
                color = 0xff0000; // Red
                break;
        }
        // Create a star with properties
        let star = stars.create(x, y, 'star').setScale(starScale);
        star.gravitationalRange = gravitationalRange;
        star.gravitationalStrength = gravitationalStrength;
        star.starType = starType;

        // Drawing gravitational effect around the star
        graphics.lineStyle(2, color, 0.2);
        graphics.strokeCircle(star.x, star.y, gravitationalRange);
    }

    // Create asteroids with random positions and velocities
    for (let i = 0; i < starCount; i++) {
        let x = Phaser.Math.Between(0, mapWidth);
        let y = Phaser.Math.Between(0, mapHeight);
        createAsteroid.call(this, x, y);
    }

    this.anims.create({
        key: 'thrust',
        frames: [
            { key: 'thruster_1' },
            { key: 'thruster_2' },
            { key: 'thruster_3' },
            { key: 'thruster_4' },
            { key: 'thruster_5' },
            { key: 'thruster_6' },
            { key: 'thruster_7' },
            { key: 'thruster_8' },
            { key: 'thruster_9' },
            { key: 'thruster_10' }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.input.on('pointerdown', pointer => {
        targetAngle = Phaser.Math.Angle.Between(spaceshipContainer.x, spaceshipContainer.y, pointer.x, pointer.y) + Phaser.Math.DegToRad(90);
        isRotatingToMouse = true;
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.startFollow(spaceshipContainer);
    console.log("Camera now following:", this.cameras.main.follow);

    var graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 1);
    graphics.strokeRect(0, 0, mapWidth, mapHeight);
    // Drawing gravitational effect around each star
    stars.getChildren().forEach(star => {
        var graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffff00, alpha: 0.3 } });
        graphics.strokeCircle(star.x, star.y, maxGravitationalRange);
    });

    // Initialize variables for the trail
    this.trailPositions = [];
    this.trailGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });

    // asteroids collisions
    this.physics.add.collider(spaceshipContainer, asteroids, handleCollision, null, this);
}

function update() {
    // Keyboard-driven rotation
    if (cursors.left.isDown || cursors.right.isDown) {
        isRotatingToMouse = false; // Immediately take over control with keyboard input
        if (cursors.left.isDown) {
            spaceshipContainer.rotation -= rotationSpeed;
        } else if (cursors.right.isDown) {
            spaceshipContainer.rotation += rotationSpeed;
        }
    }
    // Mouse-driven rotation (only if not overridden by keyboard)
    else if (isRotatingToMouse && targetAngle !== undefined) {
        let newRotation = Phaser.Math.Angle.RotateTo(spaceshipContainer.rotation, targetAngle, rotationSpeed);
        if (Phaser.Math.Distance.Between(spaceshipContainer.rotation, targetAngle) < Phaser.Math.DegToRad(1)) {
            spaceshipContainer.rotation = targetAngle; // Snap to exact angle
            targetAngle = undefined;
            isRotatingToMouse = false; // Disable mouse-driven rotation
        } else {
            spaceshipContainer.rotation = newRotation;
        }
    }
    updateSpaceshipHitbox();
    thrustForce = 200;
    if (cursors.down.isDown) {
        this.physics.velocityFromRotation(spaceshipContainer.rotation + Math.PI / 2, thrustForce, spaceshipContainer.body.acceleration);
    } else if (cursors.up.isDown || (this.input.activePointer.isDown && !isMouseDown)) {
        this.physics.velocityFromRotation(spaceshipContainer.rotation - Math.PI / 2, thrustForce, spaceshipContainer.body.acceleration);
    } else {
        spaceshipContainer.body.setAcceleration(0);
    }

    // Wrap objects around the world edges
    this.physics.world.wrap(spaceshipContainer, 5);
    this.physics.world.wrap(stars, 5);
    this.physics.world.wrap(asteroids, 5);

    // Apply gravitational force from stars
    stars.getChildren().forEach(star => {
        let distance = Phaser.Math.Distance.Between(spaceshipContainer.x, spaceshipContainer.y, star.x, star.y);
        if (distance < star.gravitationalRange && distance > 0) {
            let forceMagnitude = star.gravitationalStrength / distance;
            let angle = Phaser.Math.Angle.Between(spaceshipContainer.x, spaceshipContainer.y, star.x, star.y);
            spaceshipContainer.body.acceleration.x += Math.cos(angle) * forceMagnitude;
            spaceshipContainer.body.acceleration.y += Math.sin(angle) * forceMagnitude;
        }
    });

    // Update trail positions
    this.trailPositions.push({ x: spaceshipContainer.x, y: spaceshipContainer.y });

    // Extend the length of the trail to 60 positions (three times longer)
    if (this.trailPositions.length > 90) {
        this.trailPositions.shift(); // Remove the oldest position
    }

    // Draw the extended trail with a tapering effect
    this.trailGraphics.clear();
    for (let i = 0; i < this.trailPositions.length - 1; i++) {
        // Set alpha based on position in the array to create a fading effect
        let alpha = (i / this.trailPositions.length);
        this.trailGraphics.lineStyle(2, 0xffffff, alpha);

        // Draw each segment of the trail with a tapered end
        this.trailGraphics.lineBetween(
            this.trailPositions[i].x, this.trailPositions[i].y,
            this.trailPositions[i + 1].x, this.trailPositions[i + 1].y
        );
    }
}

function handleCollision(spaceship, asteroid) {
    // Placeholder for explosion animation or sound effect
    console.log('Collision! Game Over.');

    // Stop the game (or any movement)
    this.physics.pause();

    // Display 'Game Over' message
    let gameOverText = this.add.text(
        this.cameras.main.centerX, 
        this.cameras.main.centerY, 
        'Game Over. Press any key to retry', 
        { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);

    // Set up an event listener for restarting the game
    this.input.keyboard.once('keydown', () => {
        gameOverText.destroy();
        this.scene.restart(); // Restart the current scene
    });
}

// Placeholder function for future score or state data
function updateScore() {
    // Implement score update logic here
}

function createAsteroid(x, y) {
    let originalWidth = 210; // Replace with actual width of asteroid image
    let originalHeight = 250; // Replace with actual height of asteroid image
    let asteroidScale = 0.5; 

    let hitboxWidth = originalWidth * 0.65 * asteroidScale; // 65% of the width, scaled
    let hitboxHeight = originalHeight * 0.75 * asteroidScale; // 75% of the height, scaled

    let offsetX = (originalWidth - hitboxWidth) / 2; // Centered
    let offsetY = (originalHeight - hitboxHeight) / 2; // Centered

    let asteroid = this.physics.add.sprite(x, y, 'asteroid').setScale(asteroidScale);
    asteroid.body.setSize(hitboxWidth, hitboxHeight);
    asteroid.body.setOffset(offsetX, offsetY);

    return asteroid;
}

function updateSpaceshipHitbox() {
    if (spaceshipContainer && spaceshipContainer.body) {
        let rotationOffsetX = Math.cos(spaceshipContainer.rotation) * offsetX - Math.sin(spaceshipContainer.rotation) * offsetY;
        let rotationOffsetY = Math.sin(spaceshipContainer.rotation) * offsetX + Math.cos(spaceshipContainer.rotation) * offsetY;
        spaceshipContainer.body.setOffset(rotationOffsetX, rotationOffsetY);
    }
}