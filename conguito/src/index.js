import Phaser from 'phaser';
import BotaoSom from './SoundButton';


// 🎬 Cena do Menu
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('startButton', 'assets/play.png'); // Um botão simples como imagem
        this.load.image('conguitoLogo', 'assets/logo.png'); // Usado como a logo principal
        this.load.audio('menuMusic', 'assets/musica/menuMusic.mp3');
    }

    create() {
        // Fundo

        this.add.image(0, 0, 'sky')
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Logo e botão nas posições fixas
        this.add.image(400, 100, 'conguitoLogo').setScale(0.8);

        const startButton = this.add.image(400, 250, 'startButton')
            .setInteractive()
            .setScale(0.2);
            this.tweens.add({
            targets: startButton,
            alpha: 0.3,
            duration: 800,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });

        startButton.on('pointerdown', () => {
            if (this.menuMusic.isPlaying) {
                this.menuMusic.stop();
            }
            this.scene.start('GameScene');
        });

        // Tocar música direto (pode ser bloqueado por navegador)
        this.menuMusic = this.sound.add('menuMusic', {
            loop: true,
            volume: 0.3
        });

        this.menuMusic.play();

        //Isso cria o botão de som no canto inferior direito da cena atual, permitindo 
        //    que o jogador clique para mutar/desmutar o áudio da cena.
        this.botaoSom = new BotaoSom(this);

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
        this.load.image('aviao', 'assets/aviao.png');
        this.load.spritesheet('aviaoAnimVeloc', 'assets/aviaospritesheet-aumentoVelocidade.png', {
            frameWidth: 109,
            frameHeight: 61

        });

        //precisa adicionar frame de personagem morto!!!!!!!!!!!!!!
        //ataque tmb !!!!!!!

        //audios
        this.load.audio('perdeu', 'assets/musica/perdeu.mp3');

    }

    create() {
        this.add.image(0, 0, 'sky')
            .setOrigin(0) // alinha ao canto superior esquerdo
            .setDisplaySize(this.scale.width, this.scale.height); // redimensiona para preencher

        this.score = 0;
        this.gameOver = false;

        this.scoreVelocidade = 0; // Variavel que vai determinar a velocidade do aviao; Começa em 150 ja!!!


        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.jaPerdeu = false;

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

       this.scoreText = this.add.text(16, 16, 'Score: 0', { 
       fontSize: '32px', 
       fill: '#fff', 
       stroke: '#000', 
       strokeThickness: 3 
    });


        // Avião no topo da tela
        this.aviao = this.physics.add.sprite(400, 40, 'aviao').setScale(0.7);
        this.velocidadeBaseAviao = 150;
        this.aviao.setVelocityX(this.velocidadeBaseAviao);
        this.aviao.setCollideWorldBounds(true);
        this.aviao.setBounce(1, 0);
        this.aviao.body.allowGravity = false; // Avião não é afetado pela gravidade

        // Timer que solta bombas a cada 5 segundos
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                const bomb = this.bombs.create(this.aviao.x, this.aviao.y + 20, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-100, 100), 200); // queda com leve variação horizontal
            }
        });
        this.botaoSom = new BotaoSom(this);

        ////////SPRITE DO AVIAO AUMENTANDO VELOCIDADE///////////

        this.anims.create({

            key: 'spriteAviaoVelocidade',
            frames: this.anims.generateFrameNumbers('aviaoAnimVeloc', {start: 0, end: 4}),
            frameRate: 10,
            repeat: 0,
            hideOnComplete: true

        });

        this.animacaoBombardiloVeloc = this.add.sprite(
            this.scale.width / 2,
            this.scale.height / 2,
            'aviaoAnimVeloc'
        )
        .setVisible(false)
        .setDepth(100)
        .setScale(0.7);
    }

    update() {

        ///////////Aviao Voando////////////////
        this.aviao.y = 40; // Mantém o avião em uma só altura

        const velocidadeAtual = this.velocidadeBaseAviao + this.scoreVelocidade;// Para a soma de velocidade do aviao.

        if (this.aviao.body.blocked.right) {
            this.aviao.setVelocityX(-velocidadeAtual);
            this.aviao.setFlipX(true);
            console.log(`Avião indo para ESQUERDA com velocidade: ${-velocidadeAtual}`);
        } else if (this.aviao.body.blocked.left) {
            this.aviao.setVelocityX(velocidadeAtual);
            this.aviao.setFlipX(false);
            console.log(`Avião indo para DIREITA com velocidade: ${velocidadeAtual}`);

        }
        //////////////////////////////////
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

        //LOGICA PARA AUMENTO DE VELOCIDADE//
        const pontosAumentoVelocidade = 50; // A cada 50 pontos, aumenta a velocidade
        const valorAumentoVelocidade = 10;    // Velocidade aumentada em 10
        const tempoParadaAviao = 500;

        const velocidadeBombardilo = this.velocidadeBaseAviao + this.scoreVelocidade; // Velocidade antes da parada do bombardillo, para controle 

        if (this.score > 0 && this.score % pontosAumentoVelocidade === 0) {
            this.scoreVelocidade += valorAumentoVelocidade;
            console.log(`--- VELOCIDADE DO AVIÃO AUMENTADA! ---`);
            console.log(`Score atual: ${this.score}`);
            console.log(`Bônus de velocidade (scoreVelocidade): ${this.scoreVelocidade}`);


            ////////Pausadinha/////////
            let direcaoDoBombardilo = this.aviao.body.velocity.x; // Para saber se o bombardillo esta indo Direita/Esquerda

            if (direcaoDoBombardilo === 0){
                direcaoDoBombardilo = 1;
            }

            this.aviao.setVelocityX(0);
            this.aviao.setVelocityY(0); // Garante que não haja movimento vertical residual
            this.aviao.body.allowGravity = false; // Garante que a gravidade não o afete durante a pausa

            this.animacaoBombardiloVeloc.setPosition(this.aviao.x, this.aviao.y);
            this.animacaoBombardiloVeloc.setVisible(true);
            this.animacaoBombardiloVeloc.play('spriteAviaoVelocidade');

            this.time.delayedCall(tempoParadaAviao, () => {
            

                //Aplicar a nova velocidade após a pausa
                const velocidadeAtual = this.velocidadeBaseAviao + this.scoreVelocidade;

                    // Retomar o movimento na direção correta
                    // Usamos a velocidade do frame anterior para saber a direção que ele estava
                  

                if (direcaoDoBombardilo >= 0) { // Se estava indo para direita ou parado
                        this.aviao.setVelocityX(velocidadeAtual);
                        this.aviao.setFlipX(false); // Garante que a imagem não esteja invertida se for para direita
                } else { // Se estava indo para esquerda
                        this.aviao.setVelocityX(-velocidadeAtual);
                        this.aviao.setFlipX(true); // Garante que a imagem esteja invertida se for para esquerda
                }

            }, [], this);   

            }else {
                console.log(`Score atual: ${this.score}. Não é hora de aumentar a velocidade.`);

                const velocidadeAtual = this.velocidadeBaseAviao + this.scoreVelocidade;
                if (this.aviao.body.velocity.x > 0) { // Se estiver indo para a direita
                    this.aviao.setVelocityX(velocidadeAtual);
                } else { // Se estiver indo para a esquerda
                    this.aviao.setVelocityX(-velocidadeAtual);
                }    
            }

        //////////////////////////////////////////////

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

        this.perdeu();
    }

    perdeu() {
        if (this.jaPerdeu) return;
        this.jaPerdeu = true;

        // Trocar textura do sprite por outro (sem sumir com ele)
        this.player.setTexture('morto'); // ← precisa carregar essa imagem no preload

        // Parar a física para o jogador não continuar se mexendo
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        const somDerrota = this.sound.add('perdeu');
        somDerrota.play();

        somDerrota.once('complete', () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
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
        this.add.image(800, 300, 'sky');
        this.add.text(400, 200, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.add.text(400, 300, `Score: ${this.finalScore}`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, 'Clique para reiniciar', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        this.botaoSom = new BotaoSom(this);
    }
}

window.configuracoesJogo = {
    somAtivo: true
};

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
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
