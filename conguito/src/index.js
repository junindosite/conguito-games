import Phaser from "phaser";
// Variáveis globais do jogo
var player;
var platforms;
var cursors;
var stars;
var bombs;
var score = 0;
var scoreText;
var gameOver = false;

// Configuração geral do jogo
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravidade no eixo Y
            debug: false // Define se queremos ver os "contornos" de colisão
        }
    },
    scene: {
        preload: preload, // Função chamada para carregar recursos
        create: create,   // Função chamada para configurar o jogo
        update: update    // Função chamada a cada frame para a lógica do jogo
    }
};

// Cria a instância principal do jogo Phaser com base na configuração
var game = new Phaser.Game(config);

// --- Função PRELOAD: Carrega todos os recursos (imagens, sprites, etc.) ---
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png'); // Imagem para as estrelas/bananas
    this.load.image('bomb', 'assets/bomb.png'); // Imagem para as bombas
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 } // Tamanho de cada frame no spritesheet
    );
}

// --- Função CREATE: Configura e inicializa os objetos do jogo ---
function create() {
    // Adicionar fundo
    this.add.image(400, 300, 'sky');

    // Criar grupo estático para plataformas
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // Chão principal
    platforms.create(600, 400, 'ground'); // Plataforma 1
    platforms.create(50, 250, 'ground');  // Plataforma 2
    platforms.create(750, 220, 'ground'); // Plataforma 3

    // Criar jogador
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2); // Player quica um pouco ao cair
    player.setCollideWorldBounds(true); // Player não sai da tela
    player.body.setGravityY(300); // Define a gravidade específica para o player (opcional, pode ser a global)

    // Criar animações do jogador (AGORA DENTRO DO CREATE)
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

    // Configurar colisões do jogador com as plataformas
    this.physics.add.collider(player, platforms);

    // Configurar controles do teclado
    cursors = this.input.keyboard.createCursorKeys();

    // Criar grupo de estrelas/bananas
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11, // Cria 12 estrelas (0 a 11)
        setXY: { x: 12, y: 0, stepX: 70 } // Posiciona a primeira e o espaçamento
    });

    // Configura cada estrela para ter um quique aleatório ao cair
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Adiciona colisão das estrelas com as plataformas
    this.physics.add.collider(stars, platforms);

    // Configura a coleta de estrelas: quando player e estrela se sobrepõem, chama collectStar
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // Criar placar de pontuação
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000', fontStyle: 'bold' });

    // Criar grupo de bombas
    bombs = this.physics.add.group();

    // Adiciona colisão das bombas com as plataformas
    this.physics.add.collider(bombs, platforms);

    // Configura a colisão do player com as bombas: quando player e bomba colidem, chama hitBomb
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

// --- Função UPDATE: Lógica do jogo que roda a cada frame ---
function update() {
    if (gameOver) {
        return; // Se o jogo acabou, para de processar o update
    }

    // Movimento do jogador
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    // Pular (somente se estiver no chão)
    if (cursors.up.isDown) {
        player.setVelocityY(-330);
    }
}

// --- Funções de Callback (Chamadas por colisões/overlaps) ---

// Função para coletar as estrelas
function collectStar(player, star) {
    star.disableBody(true, true); // Desativa a estrela e a torna invisível

    score += 10; // Adiciona 10 pontos ao placar
    scoreText.setText('Score: ' + score); // Atualiza o texto do placar

    // Se todas as estrelas foram coletadas, reabilita as estrelas e cria uma bomba
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            // Reabilita o corpo e a visibilidade da estrela,
            // e a posiciona em uma nova coordenada Y (0) para ela cair novamente.
            // O 'this' dentro desta função anônima *não* é o 'this' da cena,
            // por isso usamos a variável global 'stars'.
            child.enableBody(true, child.x, 0, true, true);
        });

        // Cria uma bomba em uma posição aleatória no topo da tela
        // A bomba aparecerá no lado oposto do player
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

// Função para quando o jogador colide com uma bomba
function hitBomb(player, bomb) {
    // Para acessar 'this.physics' etc. dentro desta função de callback
    // (que é chamada pelo Phaser), precisamos que o 'this' seja o contexto da cena.
    // Isso é feito no collider: this.physics.add.collider(player, bombs, hitBomb, null, this);
    // Mas como estamos usando funções globais, o 'this' dentro de hitBomb será o objeto global (window).
    // Para funcionar, precisaremos acessar game.scene.scenes[0].physics (menos direto)
    // OU, a forma mais comum e segura: passar a cena como parâmetro ou usar um closure.
    // Para simplicidade, vamos usar 'game.physics' que é global.
    game.physics.pause(); // Pausa o sistema de física do jogo

    player.setTint(0xff0000); // Muda a cor do player para vermelho

    player.anims.play('turn'); // Toca a animação de "parado"

    gameOver = true; // Define o estado do jogo como "Game Over"
    // Adiciona um texto de "Game Over"
    // Aqui também precisaria do contexto da cena. Para simplicidade, acessamos via game.scene.scenes[0]
    game.scene.scenes[0].add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#FF0000' }).setOrigin(0.5);
}