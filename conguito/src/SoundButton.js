// Classe para criar um botão de som que pode mutar/desmutar o áudio
export default class BotaoSom {
  constructor(cena) {
    this.cena = cena;
  

    // Define se o som está mutado com base nas configurações globais
    this.estaMutado = !window.configuracoesJogo.somAtivo;

    // Define a posição do botão (canto inferior direito)
    const x = this.cena.scale.width - 20;
    const y = this.cena.scale.height - 20;

    // Cria o botão visual com texto (🔊 ou 🔇)
    this.botao = this.cena.add.text(x, y, this.estaMutado ? '🔇' : '🔊', {
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(1,22) // Canto superior direito
  .setInteractive(); // Torna o botão clicável

    // Adiciona evento de clique para alternar som
    this.botao.on('pointerdown', () => {
      this.alternarSom();
      console.log("mudando som")
    });

    // Aplica o estado atual (mutado ou não)
    this.aplicarSom();
  }

  // Alterna entre som ligado e mutado
  alternarSom() {
    this.estaMutado = !this.estaMutado;
    window.configuracoesJogo.somAtivo = !this.estaMutado;
    this.botao.setText(this.estaMutado ? '🔇' : '🔊'); // Atualiza o ícone
    this.aplicarSom(); // Aplica no sistema de som do Phaser
  }

  // Define o som como mutado ou não dentro da cena
  aplicarSom() {
    this.cena.sound.mute = this.estaMutado;
  }
}
