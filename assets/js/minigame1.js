class CorridaMatematica {
    constructor() {
        // Variáveis de estado do jogo
        this.posicaoJogador = 80;
        this.posicaoTela = 0;
        this.jogoAcabou = false;
        this.respostaCorreta = 0;
        this.frameCount = 0; // Contador para controlar velocidade
        this.framesPorMovimento = 6; // Mover tela a cada 6 frames (~10 FPS)

        // Elementos do DOM
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.questionLabel = document.getElementById('questionLabel');
        this.answerInput = document.getElementById('answerInput');
        this.feedbackLabel = document.getElementById('feedbackLabel');
        this.resetButton = document.getElementById('resetButton'); // Botão reset

        // Carregar a imagem do barco (opcional)
        this.boatImage = new Image();
        this.boatImage.src = 'boat.png';

        // Iniciar o jogo imediatamente
        this.startGame();

        // Configurar evento de input
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.jogoAcabou) {
                this.verificarResposta();
                if (!this.jogoAcabou) {
                    this.gerarNovaPergunta();
                }
            }
        });

        // Configurar botão reset
        this.resetButton.addEventListener('click', () => {
            this.resetGame();
        });
    }

    startGame() {
        this.gerarNovaPergunta();
        this.moverTela();
    }

    resetGame() {
        // Resetar variáveis do jogo
        this.posicaoJogador = 80;
        this.posicaoTela = 0;
        this.jogoAcabou = false;
        this.frameCount = 0;
        this.respostaCorreta = 0;

        // Resetar UI
        this.answerInput.disabled = false;
        this.answerInput.value = '';
        this.feedbackLabel.textContent = 'Digite a resposta e aperte Enter.';
        this.feedbackLabel.style.color = '#000000';
        this.questionLabel.textContent = 'Pergunta aparecerá aqui';
        this.resetButton.style.display = 'none'; // Esconder botão no início

        // Reiniciar jogo
        this.startGame();
        this.desenhar();
    }

    gerarNovaPergunta() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.respostaCorreta = num1 + num2;
        this.questionLabel.textContent = `Quanto é ${num1} + ${num2}? `;
        this.answerInput.value = '';
        this.answerInput.focus();
    }

    verificarResposta() {
        const textoResposta = this.answerInput.value;
        this.answerInput.value = '';

        try {
            const respostaJogador = parseInt(textoResposta);
            if (isNaN(respostaJogador)) throw new Error('Entrada inválida');

            if (respostaJogador === this.respostaCorreta) {
                this.posicaoJogador += 20;
                this.feedbackLabel.textContent = 'Correto! Lesgoo!';
                this.feedbackLabel.style.color = '#009900'; // Verde
            } else {
                this.posicaoJogador -= 10;
                this.feedbackLabel.textContent = `Errado! A resposta era ${this.respostaCorreta}`;
                this.feedbackLabel.style.color = '#FF0000'; // Vermelho
            }

            // Verificar vitória (ajustado para tamanho do barco/retângulo)
            if (this.posicaoJogador >= this.canvas.width - 32) {
                this.jogoAcabou = true;
                this.feedbackLabel.textContent = 'VITÓRIA!';
                this.feedbackLabel.style.color = '#0000FF'; // Azul
                this.questionLabel.textContent = 'Parabéns!';
                this.answerInput.disabled = true;
                this.resetButton.style.display = 'inline'; // Mostrar botão reset
                alert('Conseguiu chegar ao final!');
            }
        } catch (e) {
            this.feedbackLabel.textContent = 'Inválido. Ficou no mesmo lugar.';
            this.feedbackLabel.style.color = '#FFA500'; // Laranja
        }

        this.desenhar();
    }

    desenhar() {
        // Limpar o canvas
        this.ctx.fillStyle = '#FFFFFF'; // Branco
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar a tela (fundo azul)
        this.ctx.fillStyle = 'rgba(0, 166, 255, 0.73)'; // Azul com transparência
        this.ctx.fillRect(0, 0, this.posicaoTela, this.canvas.height);

        // Desenhar o barco OU retângulo marrom (fallback)
        if (this.boatImage.complete && this.boatImage.naturalWidth !== 0) {
            this.ctx.drawImage(this.boatImage, this.posicaoJogador, 20, 32, 32);
        } else {
            // Fallback: retângulo marrom original
            this.ctx.fillStyle = 'rgba(78, 45, 37, 1)'; // Marrom
            this.ctx.fillRect(this.posicaoJogador, 20, 10, this.canvas.height - 40);
        }
    }

    moverTela() {
        if (this.jogoAcabou) return;

        this.frameCount++;

        // Mover tela apenas a cada 6 frames (~10 FPS, igual ao Java original)
        if (this.frameCount >= this.framesPorMovimento) {
            this.posicaoTela++;
            this.frameCount = 0; // Resetar contador
        }

        // Verificar derrota
        if (this.posicaoTela >= this.posicaoJogador) {
            this.jogoAcabou = true;
            this.feedbackLabel.textContent = 'FIM DE JOGO!';
            this.feedbackLabel.style.color = '#000000'; // Preto
            this.questionLabel.textContent = 'Não foi desta vez...';
            this.answerInput.disabled = true;
            this.resetButton.style.display = 'inline'; // Mostrar botão reset
            alert('Puts, deu ruim!');
        } else {
            this.desenhar();
            requestAnimationFrame(() => this.moverTela());
        }
    }
}

// Iniciar o jogo quando a página carregar
window.onload = () => {
    new CorridaMatematica();
};