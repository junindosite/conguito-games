import Phaser from 'phaser';

// 🎬 Cena do Menu
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('startButton', 'assets/play.png'); // Um botão simples como imagem
        this.load.image('conguitoLogo', 'assets/logo.png'); // Usado como a logo principal
        this.load.image('chao', 'assets/chaomenu.png');
        this.load.image('tree', 'assets/tree.png');
    }

    create() {
        // Fundo e cenário
        this.add.image(400, 300, 'sky');
        // Chão
         const ground = this.add.tileSprite(400, 510, 800, 48, 'chao');
        ground.setOrigin(0.5, 1);   

        // Árvore (posicionada no canto inferior direito, ajustada para o chão)
         const tree = this.add.image(830, 510, 'tree') // x: lado direito, y: meio vertical
       .setOrigin(1, 1) // canto inferior direito como base
       .setScale(0.5);
         this.add.image(400, 100, 'conguitoLogo').setScale(0.8);
        // Botão de Iniciar Jogo
        const startButton = this.add.image(400, 250, 'startButton') .setInteractive();
        startButton.setScale(0.2);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}


// 🎮 Cena Principal do Jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.add.image(400, 300, 'sky');

        this.score = 0;
        this.gameOver = false;

        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, platforms);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(this.stars, platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });


        //bomba no começa em posição aleatoria
        const initialBombX = Phaser.Math.Between(0, 800); // Posição X aleatória
        const bomb = this.bombs.create(initialBombX, 16, 'bomb'); // Y=16 para aparecer no topo
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    update() {
        if (this.gameOver) {
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    collectStar(player, star) {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            const x = (this.player.x < 400)
                ? Phaser.Math.Between(400, 800)
                : Phaser.Math.Between(0, 400);

            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);
        player.anims.play('turn');

        this.gameOver = true;

        this.scene.start('GameOverScene', { score: this.score });
    }
}

// ☠️ Cena de Game Over
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score;
    }

    create() {
        this.add.image(400, 300, 'sky');
        this.add.text(400, 200, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(400, 300, `Score: ${this.finalScore}`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, 'Clique para reiniciar', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87ceeb',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
