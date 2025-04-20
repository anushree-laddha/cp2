document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
      if (user) {
        loadUserScores(user.uid);
      } else {
        window.location.href = 'index.html';
      }
    });
  
    function loadUserScores(userId) {
      db.collection('scores').doc(userId).get()
        .then(doc => {
          const scoresTable = document.getElementById('userScores');
          scoresTable.innerHTML = '';
  
          if (doc.exists) {
            const scoresData = doc.data();
            const games = [
              { id: 'snake', name: 'Snake Game' },
              { id: 'memory', name: 'Memory Game' },
              { id: 'flappy', name: 'Flappy Bird' },
              { id: 'tictactoe', name: 'Tic Tac Toe' },
              { id: 'breakout', name: 'Breakout' },
              { id: 'space', name: 'Space Invaders' },
              { id: 'puzzle', name: 'Slide Puzzle' },
              { id: 'wordguess', name: 'Word Guess' }
            ];
  
            games.forEach(game => {
              const gameData = scoresData[game.id] || {
                highScore: 'N/A',
                lastPlayed: null,
                timesPlayed: 0
              };
  
              const row = document.createElement('tr');
              
              // Game name
              const gameCell = document.createElement('td');
              gameCell.textContent = game.name;
              row.appendChild(gameCell);
  
              // High score
              const scoreCell = document.createElement('td');
              scoreCell.textContent = gameData.highScore;
              row.appendChild(scoreCell);
  
              // Last played
              const lastPlayedCell = document.createElement('td');
              lastPlayedCell.textContent = gameData.lastPlayed 
                ? new Date(gameData.lastPlayed.toDate()).toLocaleDateString()
                : 'Never';
              row.appendChild(lastPlayedCell);
  
              // Times played
              const timesPlayedCell = document.createElement('td');
              timesPlayedCell.textContent = gameData.timesPlayed;
              row.appendChild(timesPlayedCell);
  
              scoresTable.appendChild(row);
            });
          } else {
            scoresTable.innerHTML = '<tr><td colspan="4">No scores yet. Play some games!</td></tr>';
          }
        })
        .catch(error => {
          console.error('Error loading scores:', error);
        });
    }
  });