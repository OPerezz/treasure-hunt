const closeButton = document.getElementById('close-button');
const modalInfo = document.querySelector('.papiro');
const tableGame = document.querySelector('.container-table');

closeButton.addEventListener('click', function() {
    modalInfo.classList.add('hidden')
    tableGame.classList.remove('hidden')
});