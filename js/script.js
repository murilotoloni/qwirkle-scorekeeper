let players = [];
let currentPlayerIndex = 0;
let scoreToAdd = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('players')) {
        players = JSON.parse(localStorage.getItem('players'));
        currentPlayerIndex = 0;
        rebuildUI();
    }
    updateCurrentPlayer();
});

function setupPlayers(number) {
    players = [];
    currentPlayerIndex = 0;
    for (let i = 0; i < number; i++) {
        const player = {
            name: `Player ${i + 1}`,
            scores: []
        };
        players.push(player);
    }
    updateLocalStorage();
    rebuildUI();
    closeMenu();
    updateCurrentPlayer();
}

function addScore() {
    if (scoreToAdd > 0 && players.length > 0) {
        players[currentPlayerIndex].scores.push(scoreToAdd);
        updateLocalStorage();
        updateScoreDisplay(currentPlayerIndex);
        clearScoreToAdd();
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateCurrentPlayer();
    }
}

function removeLastScore(playerIndex) {
    if (players[playerIndex].scores.length > 0) {
        players[playerIndex].scores.pop();
        updateLocalStorage();
        updateScoreDisplay(playerIndex);
    }
}

function resetScores() {
    players.forEach(player => player.scores = []);
    updateLocalStorage();
    rebuildUI();
    closeResetModal();
    updateCurrentPlayer();
}

function updateScoreDisplay(playerIndex) {
    const scoreList = document.getElementById(`scorelist${playerIndex}`);
    scoreList.textContent = players[playerIndex].scores.join('+') + ' ';
}

function skipPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
}

function updateCurrentPlayer() {
    if (players.length > 0) {
        document.getElementById('current-player').textContent = `Current Player: ${players[currentPlayerIndex].name}`;
    } else {
        document.getElementById('current-player').textContent = '';
    }
}

function updateName(index, newName) {
    players[index].name = newName;
    updateLocalStorage();
    if (index === currentPlayerIndex) {
        updateCurrentPlayer();
    }
}

function updateLocalStorage() {
    localStorage.setItem('players', JSON.stringify(players));
}

function verifyCurrentPlayers(){
    const p = localStorage.getItem('players');
    if(!p) {
        openMenu();
    }
}

function rebuildUI() {
    const scoreboard = document.getElementById('scoreboard');
    const activeElement = document.activeElement;
    const activeElementId = activeElement ? activeElement.id : null;
    const selectionStart = activeElement && activeElement.selectionStart;
    const selectionEnd = activeElement && activeElement.selectionEnd;

    scoreboard.innerHTML = '';
    players.forEach((player, i) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-score';
        playerDiv.innerHTML = `
            <input type='text' id='name${i}' value='${player.name}' oninput='updateName(${i}, this.value)'/>
            <div class='score-container'>
                <div id='scorelist${i}' class='score-list'>${player.scores.join('+')} </div>
                <button onclick='removeLastScore(${i})' class='remove-score'><i class='fas fa-times'></i></button>
            </div>`;
        scoreboard.appendChild(playerDiv);
    });
    updateCurrentPlayer();

    if (activeElementId) {
        const elementToFocus = document.getElementById(activeElementId);
        if (elementToFocus) {
            elementToFocus.focus();
            if (typeof elementToFocus.setSelectionRange === 'function' &&
                selectionStart !== null && selectionEnd !== null) {
                elementToFocus.setSelectionRange(selectionStart, selectionEnd);
            }
        }
    }
}

function updateScoreToAdd(value) {
    scoreToAdd += value;
    updateScoreToAddDisplay();
}

function clearScoreToAdd() {
    scoreToAdd = 0;
    updateScoreToAddDisplay();
}

function updateScoreToAddDisplay() {
    document.getElementById('scoreToAddDisplay').textContent = scoreToAdd;
}

function openMenu() {
    document.getElementById('menu-modal').style.display = 'block';
}

function closeMenu() {
    document.getElementById('menu-modal').style.display = 'none';
}

function confirmResetScores() {
    document.getElementById('reset-modal').style.display = 'block';
}

function closeResetModal() {
    document.getElementById('reset-modal').style.display = 'none';
}

function endGame() {
    const totalScores = players.map(player => {
        const total = player.scores.reduce((sum, score) => sum + score, 0);
        return { name: player.name, total: total };
    });
    const highestScore = Math.max(...totalScores.map(player => player.total));
    const winners = totalScores.filter(player => player.total === highestScore);

    let scoresHTML = '<ul>';
    totalScores.forEach(player => {
        scoresHTML += `<li>${player.name}: ${player.total}</li>`;
    });
    scoresHTML += '</ul>';

    document.getElementById('final-scores').innerHTML = scoresHTML;

    let winnerText = '';
    if (winners.length === 1) {
        winnerText = `Winner: ${winners[0].name}`;
    } else {
        const winnerNames = winners.map(player => player.name).join(', ');
        winnerText = `It's a tie between: ${winnerNames}`;
    }

    document.getElementById('winner-announcement').textContent = winnerText;
    openEndGameModal();
}

function openEndGameModal() {
    document.getElementById('endgame-modal').style.display = 'block';
}

function closeEndGameModal() {
    document.getElementById('endgame-modal').style.display = 'none';
}

window.onclick = function(event) {
    const menuModal = document.getElementById('menu-modal');
    const endgameModal = document.getElementById('endgame-modal');
    const resetModal = document.getElementById('reset-modal');
    if (event.target === menuModal) {
        closeMenu();
    } else if (event.target === endgameModal) {
        closeEndGameModal();
    } else if (event.target === resetModal) {
        closeResetModal();
    }
}

verifyCurrentPlayers();
