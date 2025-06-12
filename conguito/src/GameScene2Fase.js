import Phaser from 'phaser';
import BotaoSom from './SoundButton';

export default class GameScene2Fase extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene2Fase' });
    }

    init(data) {
        // Recebe o score da GameScene.
        // Se por algum motivo 'data' for undefined ou 'data.score' for undefined, usa 300 como fallback.
        this.score = data.score || 300; 
        console.log(`[GameScene2Fase - INIT] Score recebido: ${this.score}`);
    }

    preload() {
        console.log('Iniciando preload da Fase 2...');
        // Por favor, verifique se todos esses assets estão na pasta 'assets' com esses nomes exatos.
        this.load.image('ground2', 'assets/plataformavoa2.png');
        this.load.image('star', 'assets/banana.png');
        this.load.image('bombHF', 'assets/bombHF.png'); // Se for uma bomba diferente para Fase 2, use 'assets/bombHF.png'
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('aviaoAnimVelocFase2', 'assets/aviaospritesheet-Velocidade200.png', {
            frameWidth: 109,
            frameHeight: 61
        });
        this.load.image('chao', 'assets/chaoNovo.png');
        this.load.image('morto', 'assets/morto.png'); 

        //////////FASE 2////////////////////
        this.load.image('sky2', 'assets/FundoFase2.png'); 
        this.load.image('aviao2', 'assets/AviaoFase2.png');
        this.load.audio('coletar', 'assets/musica/coletar.mp3');



        this.load.audio('gameMusicFase2', 'assets/musica/fase2.mp3'); // Se for música diferente, mude o caminho
        this.load.audio('perdeu', 'assets/musica/perdeu.mp3');
        this.load.audio('pulo', 'assets/musica/pulo.mp3');
        console.log('Preload da Fase 2 concluído.');

    }

    create() {
        console.log('[GameScene2Fase - CREATE] Executado. Score antes de inicializar elementos: ' + this.score);

        this.add.image(0, 0, 'sky2')
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.physics.resume(); // Garante que a física esteja ativa

        // *** ESTA É A LINHA QUE FOI REMOVIDA NAS VERSÕES ANTERIORES E QUE PODE TER CAUSADO O PROBLEMA ***
        // *** NÃO DEVE EXISTIR AQUI: this.score = 0; ***
        
        this.gameOver = false;
        this.scoreVelocidade = 0; // Resetar a velocidade do avião, já que é uma nova fase

        const platforms = this.physics.add.staticGroup();

        ///////////CHAOOOO///////////////////
        platforms.create(0, 699, 'chao').setScale(1.5).refreshBody();
        platforms.create(600, 699, 'chao').setScale(1.5).refreshBody();
        platforms.create(1200, 699, 'chao').setScale(1.5).refreshBody();

        //////////////////////PLATAFORMAS///////////////////
        platforms.create(640, 560, 'ground2').setFlipX(true).setScale(0.9).refreshBody();
        platforms.create(300, 420, 'ground2').setScale(0.85).refreshBody();
        platforms.create(980, 420, 'ground2').setScale(0.85).refreshBody(); 
        platforms.create(660, 260, 'ground2').setScale(1).refreshBody();
        platforms.create(1200, 230, 'ground2').setScale(0.85).refreshBody();
        platforms.create(100, 230, 'ground2').setFlipX(true).setScale(0.85).refreshBody();
        
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
            child.angle = 15;
            child.setFlipX(Phaser.Math.RND.pick([true, false])); 
        });

        this.physics.add.collider(this.stars, platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        // O scoreText agora vai usar o valor CORRETO de this.score, que veio do init(data)
        this.scoreText = this.add.text(16, 16, '☠️Aura: ' + this.score, {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        });
        console.log('[GameScene2Fase - CREATE] ScoreText inicializado com: ' + this.score);


        this.aviao = this.physics.add.sprite(400, 50, 'aviao2').setScale(0.7);
        this.velocidadeBaseAviao = 200;
        this.aviao.setVelocityX(this.velocidadeBaseAviao);
        this.aviao.setCollideWorldBounds(true);
        this.aviao.setBounce(1, 0);
        this.aviao.body.allowGravity = false;

        this.time.addEvent({
            delay: 4000,
            loop: true,
            callback: () => {
                const bomb = this.bombs.create(this.aviao.x, this.aviao.y + 20, 'bombHF');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-100, 100), 200);
                bomb.setScale(0.7);
            }
        });

        this.sound.stopAll();
        this.gameMusic = this.sound.add('gameMusicFase2', { 
            loop: true,
            volume: 0.9
        });
        this.gameMusic.play();

        this.botaoSom = new BotaoSom(this);

        this.anims.create({
            key: 'spriteAviaoVelocidadeFase2', 
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
        this.aviao.y = 50;

        const velocidadeAtual = this.velocidadeBaseAviao + this.scoreVelocidade;

        if (this.aviao.body.blocked.right) {
            this.aviao.setVelocityX(-velocidadeAtual);
            this.aviao.setFlipX(true);
            // console.log(`Avião indo para ESQUERDA com velocidade: ${-velocidadeAtual}`); // Comentado para reduzir logs
        } else if (this.aviao.body.blocked.left) {
            this.aviao.setVelocityX(velocidadeAtual);
            this.aviao.setFlipX(false);
            // console.log(`Avião indo para DIREITA com velocidade: ${velocidadeAtual}`); // Comentado para reduzir logs

        }
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
        this.sound.play('pulo'); //
        }
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.sound.play('coletar');


        this.score += 10;
        this.scoreText.setText('☠️Aura: ' + this.score);
        console.log(`[GameScene2Fase - COLLECT] Score atualizado: ${this.score}`);


         if (this.stars.countActive(true) === 0) {
              console.log("🍌 Reaparecendo bananas - versão simplificada");
              this.stars.children.iterate((estrela) => {
                  const xAleatorio = Phaser.Math.Between(50, this.scale.width - 50);
                  const yAleatorio = Phaser.Math.Between(100, 500); // Altura acessível
                  
                  estrela.enableBody(true, xAleatorio, yAleatorio, true, true);
                  estrela.setVelocity(0, 0); // Sem movimento inicial
                  estrela.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
              });
            }

        const pontosAumentoVelocidade = 50;
        const valorAumentoVelocidade = 10;
        const tempoParadaAviao = 500;

        if (this.score > 0 && this.score % pontosAumentoVelocidade === 0) { 
             this.scoreVelocidade += valorAumentoVelocidade;
            console.log(`--- VELOCIDADE DO AVIÃO AUMENTADA NA FASE 2! ---`);
            console.log(`Score atual: ${this.score}`);
            console.log(`Bônus de velocidade (scoreVelocidade): ${this.scoreVelocidade}`);

            let direcaoDoBombardilo = this.aviao.body.velocity.x;

            if (direcaoDoBombardilo === 0) {
                direcaoDoBombardilo = 1;
            }

            this.aviao.setVelocityX(0);
            this.aviao.setVelocityY(0);
            this.aviao.body.allowGravity = false;

            const duracaoTween = tempoParadaAviao / 3;
            const alturaInicialAviao = this.aviao.y;
            const alturaAbaixar = alturaInicialAviao + 1;
            const alturaSubir = alturaInicialAviao - 2;

            this.tweens.add({
                targets: this.aviao,
                y: alturaAbaixar,
                duration: duracaoTween,
                ease: 'Sine.easeOut',
                onUpdate: () => {
                    this.animacaoBombardiloVeloc.y = this.aviao.y;
                },
                onComplete: () => {
                    this.tweens.add({
                        targets: this.aviao,
                        y: alturaSubir,
                        duration: duracaoTween,
                        ease: 'Sine.easeInOut',
                        onUpdate: () => {
                            this.animacaoBombardiloVeloc.y = this.aviao.y;
                        },
                        onComplete: () => {
                            this.tweens.add({
                                targets: this.aviao,
                                y: alturaInicialAviao,
                                duration: duracaoTween,
                                ease: 'Sine.easeIn',
                                onUpdate: () => {
                                    this.animacaoBombardiloVeloc.y = this.aviao.y;
                                }
                            });
                        }
                    });
                }
            });

            this.animacaoBombardiloVeloc.setPosition(this.aviao.x, this.aviao.y);
            this.animacaoBombardiloVeloc.setVisible(true);

            if (direcaoDoBombardilo < 0) {
                this.animacaoBombardiloVeloc.setFlipX(true);
            } else {
                this.animacaoBombardiloVeloc.setFlipX(false);
            }

            this.animacaoBombardiloVeloc.play('spriteAviaoVelocidadeFase2'); 

            this.time.delayedCall(tempoParadaAviao, () => {
                const velocidadeAtual = this.velocidadeBaseAviao + this.scoreVelocidade;

                if (direcaoDoBombardilo >= 0) {
                    this.aviao.setVelocityX(velocidadeAtual);
                    this.aviao.setFlipX(false);
                } else {
                    this.aviao.setVelocityX(-velocidadeAtual);
                    this.aviao.setFlipX(true);
                }
            }, [], this);

        } else {
            // console.log(`Aura atual: ${this.score}. Não é hora de aumentar a velocidade na Fase 2.`); // Comentado para reduzir logs
            const velocidadeAtual = this.velocidadeBaseAviao + this.scoreVelocidade;
            if (this.aviao.body.velocity.x > 0) {
                this.aviao.setVelocityX(velocidadeAtual);
            } else {
                this.aviao.setVelocityX(-velocidadeAtual);
            }
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
            this.gameMusic.stop();
        }

        this.player.setTexture('morto'); 
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        const somDerrota = this.sound.add('perdeu');
        somDerrota.play();

        somDerrota.once('complete', () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }
}
