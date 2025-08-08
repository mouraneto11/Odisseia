// Dados dos jogadores e posições
let playersData = [];
let scoreData = {
    totalScore: 0,
    rankPosition: 0,
    fameGained: 0
};

// Carregar dados ao inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateScoreDisplay();
    updatePositionsDisplay();
});

// Função para carregar dados do localStorage ou arquivo JSON
function loadData() {
    try {
        const savedPlayers = localStorage.getItem('avalonPlayers');
        const savedScore = localStorage.getItem('avalonScore');
        
        if (savedPlayers) {
            playersData = JSON.parse(savedPlayers);
        }
        
        if (savedScore) {
            scoreData = JSON.parse(savedScore);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para salvar dados no localStorage
function saveData() {
    try {
        localStorage.setItem('avalonPlayers', JSON.stringify(playersData));
        localStorage.setItem('avalonScore', JSON.stringify(scoreData));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para abrir o modal de inscrição
function openRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Função para fechar o modal de inscrição
function closeRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('registrationForm').reset();
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('registrationModal');
    if (event.target === modal) {
        closeRegistrationModal();
    }
}

// Função para processar o formulário de inscrição
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const playerData = {
        id: Date.now(),
        nickname: formData.get('nickname'),
        primaryPosition: formData.get('primaryPosition'),
        secondaryPosition: formData.get('secondaryPosition'),
        motivationalPhrase: formData.get('motivationalPhrase'),
        agreement: formData.get('agreement'),
        registrationDate: new Date().toISOString()
    };
    
    // Verificar se a posição primária está disponível
    const primaryAvailable = isPositionAvailable(playerData.primaryPosition);
    const secondaryAvailable = isPositionAvailable(playerData.secondaryPosition);
    
    let assignedPosition = null;
    
    if (primaryAvailable) {
        assignedPosition = playerData.primaryPosition;
    } else if (secondaryAvailable && playerData.secondaryPosition) {
        assignedPosition = playerData.secondaryPosition;
        showNotification(`Posição primária ocupada. Você foi alocado para: ${assignedPosition}`, 'warning');
    } else {
        showNotification('Ambas as posições estão ocupadas. Você foi adicionado à lista de espera.', 'error');
        assignedPosition = 'Lista de Espera';
    }
    
    playerData.assignedPosition = assignedPosition;
    playersData.push(playerData);
    
    saveData();
    updatePositionsDisplay();
    closeRegistrationModal();
    
    showNotification(`Inscrição realizada com sucesso! Posição: ${assignedPosition}`, 'success');
});

// Função para verificar se uma posição está disponível
function isPositionAvailable(position) {
    if (!position) return false;
    
    const positionCounts = {};
    playersData.forEach(player => {
        if (player.assignedPosition && player.assignedPosition !== 'Lista de Espera') {
            positionCounts[player.assignedPosition] = (positionCounts[player.assignedPosition] || 0) + 1;
        }
    });
    
    // Definir limites para cada posição
    const positionLimits = {
        'Maintank': 1,
        'Offtank': 1,
        'Arcano elevado': 1,
        'Arcano 1h': 1,
        'Main healer': 1,
        'Raiz BM': 1,
        'Raiz Healer': 3,
        'Bruxo': 1,
        'Quebra': 1,
        'Fire': 1,
        'Frost': 1,
        'Xbow': 3
    };
    
    const currentCount = positionCounts[position] || 0;
    const limit = positionLimits[position] || 1;
    
    return currentCount < limit;
}

// Função para atualizar a exibição das posições
function updatePositionsDisplay() {
    const positionCards = document.querySelectorAll('.position-card');
    
    positionCards.forEach(card => {
        const position = card.getAttribute('data-position');
        const statusElement = card.querySelector('.position-status');
        const playerElement = card.querySelector('.position-player');
        
        // Encontrar jogadores nesta posição
        const playersInPosition = playersData.filter(player => 
            player.assignedPosition === position
        );
        
        if (playersInPosition.length > 0) {
            statusElement.textContent = 'Ocupada';
            statusElement.className = 'position-status occupied';
            
            // Mostrar informações do jogador
            playerElement.style.display = 'block';
            playerElement.innerHTML = playersInPosition.map(player => `
                <div class="player-info">
                    <div class="player-name">${player.nickname}</div>
                    ${player.motivationalPhrase ? `<div class="player-phrase">"${player.motivationalPhrase}"</div>` : ''}
                </div>
            `).join('');
        } else {
            statusElement.textContent = 'Disponível';
            statusElement.className = 'position-status available';
            playerElement.style.display = 'none';
        }
    });
}

// Função para atualizar a exibição do score
function updateScoreDisplay() {
    document.getElementById('totalScore').textContent = scoreData.totalScore.toLocaleString();
    document.getElementById('rankPosition').textContent = `#${scoreData.rankPosition}`;
    document.getElementById('fameGained').textContent = scoreData.fameGained.toLocaleString();
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Adicionar estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        border-left: 4px solid ${getNotificationBorderColor(type)};
    `;
    
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': 'linear-gradient(45deg, #2ecc71, #27ae60)',
        'error': 'linear-gradient(45deg, #e74c3c, #c0392b)',
        'warning': 'linear-gradient(45deg, #f39c12, #e67e22)',
        'info': 'linear-gradient(45deg, #3498db, #2980b9)'
    };
    return colors[type] || colors.info;
}

function getNotificationBorderColor(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#c0392b',
        'warning': '#e67e22',
        'info': '#2980b9'
    };
    return colors[type] || colors.info;
}

// Adicionar estilos de animação para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        margin-left: auto;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Função para exportar dados (para backup)
function exportData() {
    const data = {
        players: playersData,
        score: scoreData,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `avalon_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Função para importar dados
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.players && data.score) {
                playersData = data.players;
                scoreData = data.score;
                saveData();
                updatePositionsDisplay();
                updateScoreDisplay();
                showNotification('Dados importados com sucesso!', 'success');
            } else {
                showNotification('Formato de arquivo inválido!', 'error');
            }
        } catch (error) {
            showNotification('Erro ao importar dados!', 'error');
        }
    };
    reader.readAsText(file);
}

// Função para atualizar score (para administradores)
function updateScore(totalScore, rankPosition, fameGained) {
    scoreData = {
        totalScore: totalScore || 0,
        rankPosition: rankPosition || 0,
        fameGained: fameGained || 0
    };
    saveData();
    updateScoreDisplay();
}

// Adicionar funcionalidade de administrador (teclas de atalho)
document.addEventListener('keydown', function(e) {
    // Ctrl + Alt + A para abrir painel de administrador
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        openAdminPanel();
    }
});

function openAdminPanel() {
    const password = prompt('Digite a senha de administrador:');
    if (password === 'SevenClouds2024') {
        showAdminPanel();
    } else {
        showNotification('Senha incorreta!', 'error');
    }
}

function showAdminPanel() {
    const adminModal = document.createElement('div');
    adminModal.className = 'modal';
    adminModal.style.display = 'block';
    adminModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-cog"></i> Painel de Administrador</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div style="padding: 30px;">
                <div class="form-group">
                    <label>Atualizar Score:</label>
                    <input type="number" id="adminTotalScore" placeholder="Score Total" value="${scoreData.totalScore}">
                    <input type="number" id="adminRankPosition" placeholder="Posição no Ranking" value="${scoreData.rankPosition}">
                    <input type="number" id="adminFameGained" placeholder="Fame Ganho" value="${scoreData.fameGained}">
                    <button onclick="updateScoreFromAdmin()" class="btn-submit" style="margin-top: 10px;">Atualizar Score</button>
                </div>
                <div class="form-group">
                    <label>Gerenciar Dados:</label>
                    <button onclick="exportData()" class="btn-submit">Exportar Dados</button>
                    <input type="file" id="importFile" accept=".json" onchange="importData(event)" style="display: none;">
                    <button onclick="document.getElementById('importFile').click()" class="btn-submit">Importar Dados</button>
                    <button onclick="clearAllData()" class="btn-cancel">Limpar Todos os Dados</button>
                </div>
                <div class="form-group">
                    <label>Jogadores Inscritos (${playersData.length}):</label>
                    <div style="max-height: 200px; overflow-y: auto; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px;">
                        ${playersData.map(player => `
                            <div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                                <strong>${player.nickname}</strong> - ${player.assignedPosition}
                                <button onclick="removePlayer(${player.id})" style="float: right; background: #e74c3c; border: none; color: white; padding: 2px 8px; border-radius: 3px; cursor: pointer;">Remover</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(adminModal);
}

function updateScoreFromAdmin() {
    const totalScore = parseInt(document.getElementById('adminTotalScore').value) || 0;
    const rankPosition = parseInt(document.getElementById('adminRankPosition').value) || 0;
    const fameGained = parseInt(document.getElementById('adminFameGained').value) || 0;
    
    updateScore(totalScore, rankPosition, fameGained);
    showNotification('Score atualizado com sucesso!', 'success');
}

function removePlayer(playerId) {
    playersData = playersData.filter(player => player.id !== playerId);
    saveData();
    updatePositionsDisplay();
    showNotification('Jogador removido com sucesso!', 'success');
    
    // Atualizar a lista no painel admin
    const adminModal = document.querySelector('.modal');
    if (adminModal) {
        adminModal.remove();
        showAdminPanel();
    }
}

function clearAllData() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        playersData = [];
        scoreData = { totalScore: 0, rankPosition: 0, fameGained: 0 };
        saveData();
        updatePositionsDisplay();
        updateScoreDisplay();
        showNotification('Todos os dados foram limpos!', 'success');
        
        // Fechar painel admin
        document.querySelector('.modal').remove();
    }
}

// Função para simular dados de exemplo (apenas para demonstração)
function loadExampleData() {
    scoreData = {
        totalScore: 1250000,
        rankPosition: 3,
        fameGained: 45000
    };
    
    playersData = [
        {
            id: 1,
            nickname: "DragonSlayer",
            primaryPosition: "Maintank",
            secondaryPosition: "Offtank",
            motivationalPhrase: "Pela glória da SevenClouds!",
            assignedPosition: "Maintank",
            registrationDate: new Date().toISOString()
        },
        {
            id: 2,
            nickname: "MysticHealer",
            primaryPosition: "Main healer",
            secondaryPosition: "Raiz Healer",
            motivationalPhrase: "Cura e proteção para todos!",
            assignedPosition: "Main healer",
            registrationDate: new Date().toISOString()
        }
    ];
    
    saveData();
    updatePositionsDisplay();
    updateScoreDisplay();
    showNotification('Dados de exemplo carregados!', 'info');
}

// Adicionar comando para carregar dados de exemplo (Ctrl + Alt + E)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.altKey && e.key === 'e') {
        loadExampleData();
    }
});