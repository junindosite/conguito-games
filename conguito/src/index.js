import Phaser from 'phaser';
import BotaoSom from './SoundButton';
import GameScene2Fase from './GameScene2Fase';


/// cena cutscene depois do play
class CutsceneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CutsceneScene' });
    }

    preload() {
        this.load.video('cutscene', 'assets/musica/video/catsine.mp4', 'loadeddata', false, true);
        this.load.audio('cutsceneAudio', 'assets/musica/catsine.mp3');
    }

    create() {
    
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'cutscene');
             
       // Ajusta o vídeo para ocupar toda a tela, mantendo proporção
        video.setDisplaySize(this.scale.width, this.scale.height)
        .setDepth(1).play();
        const audio = this.sound.add('cutsceneAudio');
        audio.play();
        console.log('🎥 Vídeo começou')

        // Pular com ENTER
        this.input.keyboard.once('keydown-SPACE', () => {
            video.stop();
            console.log('✅ Vídeo terminou')
            audio.stop();
            this.scene.start('GameScene');
        });
        // Ou ir automaticamente para o jogo ao fim do vídeo
        video.on('complete', () => {
        audio.stop();
        this.scene.start('GameScene');
        
        });
       


    }
}


// 🎬 Cena do Menu
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('fundo', 'assets/sky.png');
        this.load.image('startButton', 'assets/play.png'); 
        this.load.image('conguitoLogo', 'assets/logo.png'); 
        this.load.audio('menuMusic', 'assets/musica/menu.mp3');
    }

    create() {
        // Fundo

        this.add.image(0, 0, 'fundo')
        .setOrigin(0)
        .setDisplaySize(this.scale.width, this.scale.height);
        // Logo e botão nas posições fixas
        this.add.image(642, 75, 'conguitoLogo').setScale(1.0);
        const startButton = this.add.image(642, 250, 'startButton') .setScale(0.2)
        .setInteractive();
        this.tweens.add({
            targets: startButton,
            alpha: 0.6,
            duration: 800,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });
        
        startButton.on('pointerdown', () => {
            if (this.menuMusic.isPlaying) {
                this.menuMusic.stop();
            }
           this.scene.start('CutsceneScene');
        });

        // Tocar música direto (pode ser bloqueado por navegador)
        this.sound.stopAll();
        this.menuMusic = this.sound.add('menuMusic', {
            loop: true,
            volume: 0.9
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
        this.load.image('sky', 'assets/skyNovo.png');
        this.load.image('ground', 'assets/plataformavoa.png');
        this.load.image('star', 'assets/banana.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('aviao', 'assets/aviao.png');
        this.load.spritesheet('aviaoAnimVeloc', 'assets/aviaospritesheet-aumentoVelocidade.png', {
            frameWidth: 109,
            frameHeight: 61

        });
        this.load.image('chao', 'assets/chaoNovo.png');

        this.load.spritesheet('aviaoAnimVelocFase2', 'assets/aviaospritesheet-Velocidade200.png', {
            frameWidth: 109,
            frameHeight: 61

        });

        //precisa adicionar frame de personagem morto!!!!!!!!!!!!!!
        //ataque tmb !!!!!!!

        //audios
        this.load.audio('gameMusic', 'assets/musica/SomDeFundo.wav');// som de fundo do jogo
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

     
         ///////////CHAOOOO///////////////////

        platforms.create(0, 699, 'chao').setScale(1.5).refreshBody();

        platforms.create(600, 699, 'chao').setScale(1.5).refreshBody();

        platforms.create(1200, 699, 'chao').setScale(1.5).refreshBody();

        //////////////////////PLATAFORMAS///////////////////

        platforms.create(640, 560, 'ground').setFlipX(true).setScale(0.9).refreshBody();
        platforms.create(300, 420, 'ground').setScale(0.85).refreshBody();
        platforms.create(980, 420, 'ground').setScale(0.85).setScale(0.85).refreshBody();

        platforms.create(660, 260, 'ground').setScale(1).refreshBody();
        
        platforms.create(1200, 230, 'ground').setScale(0.85).refreshBody();
        platforms.create(100, 230, 'ground').setFlipX(true).setScale(0.85).refreshBody();
        

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
            child.setScale(0.12);
            child.setFlipX(0.5);
            child.angle = 15;
        });

        this.physics.add.collider(this.stars, platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        this.scoreText = this.add.text(16, 16, '☠️Aura: 0', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        });


        // Avião no topo da tela
        this.aviao = this.physics.add.sprite(400, 50, 'aviao').setScale(0.7);
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

        //muisica
        this.sound.stopAll();
        this.gameMusic = this.sound.add('gameMusic', { // Cria uma instância do áudio
            loop: true, // Define para tocar em loop
            volume: 0.2// Define o volume
        });
        this.gameMusic.play(); // Inicia a reprodução da música

        this.botaoSom = new BotaoSom(this);

        ////////SPRITE DO AVIAO AUMENTANDO VELOCIDADE///////////

        this.anims.create({

            key: 'spriteAviaoVelocidade',
            frames: this.anims.generateFrameNumbers('aviaoAnimVeloc', { start: 0, end: 4 }),
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
        
        /////////FASE DOIS MINI SPRITE!//////////
        this.anims.create({

            key: 'spriteAviaoVelocidade',
            frames: this.anims.generateFrameNumbers('aviaoAnimVelocFase2', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: 0,
            hideOnComplete: true

            });

        this.animacaoBombardiloVeloc = this.add.sprite(
            this.scale.width / 2,
            this.scale.height / 2,
            'aviaoAnimVelocFase2'
        )
            .setVisible(false)
            .setDepth(100)
            .setScale(0.7);
    }

    update() {

        ///////////Aviao Voando////////////////
        this.aviao.y = 50; // Mantém o avião em uma só altura

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
        this.scoreText.setText('☠️Aura: ' + this.score);

        /////////FASE 2////////////////

        if(this.score >= 60){

            this.scene.start('GameScene2Fase', { score: this.score }); // *** Passando o score ***
            return;
        }

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

            if (direcaoDoBombardilo === 0) {
                direcaoDoBombardilo = 1;
            }

            this.aviao.setVelocityX(0);
            this.aviao.setVelocityY(0); // Garante que não haja movimento vertical
            this.aviao.body.allowGravity = false; // Garante que a gravidade não o afete durante a pausa

            const duracaoTween = tempoParadaAviao / 3; // Divide o tempo total da parada em 3 fases para o tween
            const alturaInicialAviao = this.aviao.y; // Salva a altura original (40)
            const alturaAbaixar = alturaInicialAviao + 1; // Ajusta para baixo 
            const alturaSubir = alturaInicialAviao - 2;

            this.tweens.add({ /////////////TWEENS METODO USADO PARA DAR UMA MUDADA DE POSIÇÃO NO SPRITE DO BOMBARDILLO
                targets: this.aviao,
                y: alturaAbaixar, //desce um pouco
                duration: duracaoTween, // 3 
                ease: 'Sine.easeOut',
                onUpdate: () => { // Adicionado onUpdate para seguir o avião
                    this.animacaoBombardiloVeloc.y = this.aviao.y;
                },
                onComplete: () => {
                    this.tweens.add({
                        targets: this.aviao,
                        y: alturaSubir, //sobe um pouco mais
                        duration: duracaoTween,
                        ease: 'Sine.easeInOut',
                        onUpdate: () => {
                            this.animacaoBombardiloVeloc.y = this.aviao.y;
                        },
                        onComplete: () => {
                            this.tweens.add({
                                targets: this.aviao,
                                y: alturaInicialAviao, // Volta para a posição original
                                duration: duracaoTween,
                                ease: 'Sine.easeIn',
                                onUpdate: () => { // Adicionado onUpdate para seguir o avião
                                    this.animacaoBombardiloVeloc.y = this.aviao.y;
                                }
                            });
                        }
                    });
                }
            });

            this.animacaoBombardiloVeloc.setPosition(this.aviao.x, this.aviao.y);
            this.animacaoBombardiloVeloc.setVisible(true);

            if (direcaoDoBombardilo < 0) { // Se o avião estava indo para a esquerda
                this.animacaoBombardiloVeloc.setFlipX(true);
            } else { // Se o avião estava indo para a direita ou parado
                this.animacaoBombardiloVeloc.setFlipX(false);
            }

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

        } else {
            console.log(`Aura atual: ${this.score}. Não é hora de aumentar a velocidade.`);

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

        if (this.gameMusic.isPlaying) {
            this.gameMusic.stop(); // Interrompe a reprodução da música de fundo do jogo
        }

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

    preload() {
        this.load.image('gameOver', 'assets/logoGameOver.png')
        // IREI MEXER MAIS AINDA
        this.load.image('volta', 'assets/back.png')
        this.load.audio('musicaGO', 'assets/musica/musicaGO.mp3');


    }

    create() {
        this.add.image(800, 300, 'fundo');
        this.add.text(642, 300, `☠️Aura: ${this.finalScore}+++`, {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add.text(642, 400, 'Clique para reiniciar', {
            fontSize: '40px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add.image(642, 120, 'gameOver').setScale(1.0);
        this.botaoSom = new BotaoSom(this);

        const botaoVoltar = this.add.image(642, 460, 'volta')// variavel recebe imagem
            .setScale(2.5)
            .setInteractive();
        //animação botao TWEENS BOTAO RODANDO
        this.tweens.add({
            targets: botaoVoltar,
            angle: { from: -5, to: 5 },
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        ///add musica
        // Música
        this.sound.stopAll(); // Garante que só uma música toque
        this.musicaGO = this.sound.add('musicaGO', {
            loop: true,
            volume: 0.3
        });
        this.musicaGO.play();
        //função voltar
        botaoVoltar.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });


    }
}

    


window.configuracoesJogo = {
    somAtivo: true
};

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, CutsceneScene ,GameScene, GameScene2Fase, GameOverScene],

    scale: {
        mode: Phaser.Scale.ENVELOP, // Escala o jogo para caber na tela, mantendo a proporção
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centraliza o jogo horizontal e verticalmente
        // parent: 'game-container', // Opcional: Se você tiver um div com id="game-container" no seu HTML
        // o canvas do Phaser será injetado lá.
        // Se não for definido, Phaser cria o canvas diretamente no body.
        width: 1280, // A largura de referência do seu jogo (deve ser a mesma do topo)
        height: 720  // A altura de referência do seu jogo (deve ser a mesma do topo)
    }
};

const game = new Phaser.Game(config);
