export class EnigmaDoGuardião {
    constructor() {

        this.modal = document.getElementById('modal-minigame2');
        this.gamePrincipal = document.getElementById('game-principal');
        this.questionLabel = document.getElementById('questionLabel2');
        this.answerInput = document.getElementById('answerInput2');
        this.submitButton = document.getElementById('submitButton2');
        this.feedbackLabel = document.getElementById('feedbackLabel2');


        this.respostaCorreta = "50";


        this.submitButton.addEventListener('click', () => {
            this.verificarResposta();
        });

        // Permite usar a tecla "Enter"
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verificarResposta();
            }
        });
    }


    startGame() {
        this.questionLabel.textContent = "Para provar seu valor, responda ao enigma: Quantos anos a FATEC comemora em 2024?";
        this.answerInput.value = '';
        this.feedbackLabel.textContent = 'Digite sua resposta e clique em "Responder".';
        this.feedbackLabel.style.color = '#000000';
        this.answerInput.focus();
    }


    verificarResposta() {
        const respostaJogador = this.answerInput.value.trim();

        if (respostaJogador === this.respostaCorreta) {
            // SUCESSO!
            this.feedbackLabel.textContent = `Correto! ${this.respostaCorreta} anos! O caminho final foi revelado!`;
            this.feedbackLabel.style.color = '#009900'; // Verde
            this.answerInput.disabled = true;
            this.submitButton.disabled = true;

            alert("Parabéns! Você desvendou o enigma e o caminho para o tesouro foi revelado!");

            // Esconde o modal do minigame
            this.modal.classList.add("hidden");
            // Mostra o jogo principal
            this.gamePrincipal.classList.remove("hidden");

            window.handleMiniGameComplete();

        } else {
            // ERRO
            this.feedbackLabel.textContent = "Errado! Tente novamente...";
            this.feedbackLabel.style.color = '#FF0000'; // Vermelho
            this.answerInput.value = '';
            this.answerInput.focus();
        }
    }
}