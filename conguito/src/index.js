
//Importando o phasher
import Phaser from "phaser";

// Configurações básicas do jogo Phaser
const config = {
  type: Phaser.AUTO, // Usa WebGL se disponível, senão usa Canvas
  width: 800, // Largura da tela
  height: 600, // Altura da tela
  physics: {
    default: 'arcade', // Usa o sistema de física Arcade (mais simples)
    arcade: {
      gravity: { y: 600 }, // Gravidade no eixo Y (faz o jogador cair)
      debug: false // Define se queremos ver os "contornos" de colisão
    }
  },
  scene: {
    preload: preload, // Carrega os arquivos (imagens, sons, etc.)
    create: create,   // Configura o jogo (adiciona player, chão, etc.)
    update: update    // Atualiza a lógica do jogo em tempo real (movimento, colisões)
  }
};

// Cria o jogo com base na configuração acima
const game = new Phaser.Game(config);

// Variáveis globais
let player;   // Personagem controlado pelo jogador
let cursors;  // Controles do teclado (setas)
let ground;   // Plataforma (chão)

function preload() {
  // Carrega imagens que serão usadas
  this.load.image('sky', 'assets/sky.png'); // Fundo do cenário
  this.load.image('ground', 'assets/platform.png'); // Imagem da plataforma
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 }); // Sprite do player com animações
}

function create() {
  // Adiciona o fundo
  this.add.image(400, 300, 'sky'); // (x=400, y=300 é o centro da tela)

  // Cria um grupo estático de plataformas (não se movem)
  ground = this.physics.add.staticGroup();

  // Adiciona uma plataforma no meio da tela e dobra o tamanho dela
  ground.create(400, 568, 'ground').setScale(2).refreshBody();

  // Cria o sprite do jogador e adiciona física
  player = this.physics.add.sprite(100, 450, 'dude'); // posição inicial
  player.setBounce(0.2); // Quando ele cai, quica um pouco
  player.setCollideWorldBounds(true); // Não deixa sair da tela

  // Adiciona colisão entre o jogador e o chão
  this.physics.add.collider(player, ground);

  // Animação "andar para a esquerda"
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), // frames 0 a 3
    frameRate: 10, // velocidade
    repeat: -1 // -1 = loop infinito
  });

  // Animação "parado"
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }], // frame único
    frameRate: 20
  });

  // Animação "andar para a direita"
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Ativa as teclas do teclado (setas)
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // Movimento para a esquerda
  if (cursors.left.isDown) {
    player.setVelocityX(-160); // Velocidade negativa no eixo X
    player.anims.play('left', true); // Toca a animação da esquerda

  // Movimento para a direita
  } else if (cursors.right.isDown) {
    player.setVelocityX(160); // Velocidade positiva no eixo X
    player.anims.play('right', true); // Animação da direita

  // Nenhuma tecla pressionada → para
  } else {
    player.setVelocityX(0); // Não anda
    player.anims.play('turn'); // Animação parado
  }

  // Pular (somente se estiver no chão)
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330); // Velocidade negativa no eixo Y (pulo)
  }
}
