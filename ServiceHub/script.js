document.addEventListener('DOMContentLoaded', () => {

    // --- "BASE DE DADOS" E CONFIGURAÇÕES GLOBAIS ---
    const professionals = [
        { id: 1, name: 'Ana Silva', headline: 'Especialista em limpeza residencial.', service: 'cleaning', rating: 4.9, pricePerHour: 25.00, profilePicture: 'assets/professional-1.jpg', bio: 'Com mais de 8 anos de experiência, ofereço um serviço de limpeza detalhado e de confiança. A minha paixão é transformar casas em lares impecáveis.' },
        { id: 2, name: 'Carlos Mendes', headline: 'Babysitter certificado com foco em atividades lúdicas.', service: 'babysitting', rating: 5.0, pricePerHour: 30.00, profilePicture: 'assets/professional-2.jpg', bio: 'Pedagogo de formação, tenho experiência com crianças de todas as idades. Crio um ambiente seguro e divertido, com jogos educativos.' },
        { id: 3, name: 'Mariana Costa', headline: 'Limpeza profunda e organização de ambientes.', service: 'cleaning', rating: 4.8, pricePerHour: 28.00, profilePicture: 'assets/professional-3.jpg', bio: 'Sou especialista em organização e limpeza pós-obra. Deixo qualquer ambiente a brilhar. Rápida, eficiente e com excelentes referências.' },
    ];
    const basePrices = { cleaning: 25, babysitting: 30 };

    // --- ESTADO DA APLICAÇÃO (DADOS TEMPORÁRIOS) ---
    let currentBooking = {};
    let selectedService = 'cleaning';
    let selectedHours = 2;

    // --- FUNÇÃO PRINCIPAL DE NAVEGAÇÃO ---
    function showView(viewId) {
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        const activeView = document.getElementById(viewId);
        if (activeView) {
            activeView.classList.add('active');
        }
        window.scrollTo(0, 0);
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO (CRIAM O HTML DINÂMICO) ---

    function updateBookingWidget() {
        document.getElementById('hours-display').textContent = selectedHours;
        const price = basePrices[selectedService] * selectedHours;
        document.getElementById('price-display-value').textContent = `$${price.toFixed(2)}`;
    }

    function renderSearchResults(filter = 'all') {
        const grid = document.getElementById('search-grid');
        grid.innerHTML = '';
        const filteredData = professionals.filter(p => filter === 'all' || p.service === filter);

        if (filteredData.length === 0) {
            grid.innerHTML = '<p>Nenhum profissional encontrado para esta categoria.</p>';
            return;
        }

        filteredData.forEach(prof => {
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.dataset.id = prof.id;
            card.innerHTML = `
                <img src="${prof.profilePicture}" alt="${prof.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Foto'">
                <div class="profile-card-content">
                    <h3>${prof.name}</h3>
                    <p>${prof.headline}</p>
                    <div class="rating">⭐ ${prof.rating}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function renderProfilePage(id) {
        const prof = professionals.find(p => p.id === parseInt(id));
        if (!prof) {
            showView('search-view'); // Se não encontrar, volta para a busca
            return;
        }

        document.getElementById('profile-header').innerHTML = `
            <img src="${prof.profilePicture}" alt="${prof.name}" onerror="this.src='https://via.placeholder.com/120x120?text=Sem+Foto'">
            <div>
                <h2>${prof.name}</h2>
                <p>${prof.headline}</p>
                <div class="rating">⭐ ${prof.rating}</div>
            </div>`;

        document.getElementById('profile-details').innerHTML = `<h3>Sobre mim</h3><p>${prof.bio}</p>`;
        
        document.getElementById('booking-card').innerHTML = `
            <h3>Agendar Serviço</h3>
            <p>$${prof.pricePerHour.toFixed(2)} / hora</p>
            <button class="button primary full-width book-now-profile-btn" data-id="${prof.id}">Agendar Agora</button>`;
        
        showView('profile-view');
    }

    function renderCheckoutPage() {
        if (!currentBooking.professional) return;
        const { professional, hours } = currentBooking;
        const total = professional.pricePerHour * hours;

        document.getElementById('checkout-summary').innerHTML = `
            <h3>Resumo do Pedido</h3>
            <div class="summary-item"><span>Profissional:</span><strong>${professional.name}</strong></div>
            <div class="summary-item"><span>Serviço:</span><strong>${professional.service === 'cleaning' ? 'Limpeza' : 'Babá'}</strong></div>
            <div class="summary-item"><span>Duração:</span><strong>${hours} horas</strong></div>
            <div class="summary-item total"><span>Total:</span><strong>$${total.toFixed(2)}</strong></div>`;
        
        showView('checkout-view');
    }

    // --- EVENT LISTENERS (Onde a Mágica Acontece) ---

    // Lida com a troca de abas do widget
    document.querySelector('.service-tabs').addEventListener('click', e => {
        const targetTab = e.target.closest('.service-tab');
        if (!targetTab) return;
        document.querySelectorAll('.service-tab').forEach(tab => tab.classList.remove('active'));
        targetTab.classList.add('active');
        selectedService = targetTab.dataset.service;
        updateBookingWidget();
    });

    // Lida com os botões de horas
    document.getElementById('decrease-hours').addEventListener('click', () => {
        if (selectedHours > 1) { selectedHours--; updateBookingWidget(); }
    });
    document.getElementById('increase-hours').addEventListener('click', () => {
        if (selectedHours < 12) { selectedHours++; updateBookingWidget(); }
    });

    // Lida com o botão principal do widget
    document.getElementById('widget-search-btn').addEventListener('click', () => {
        renderSearchResults(selectedService);
        showView('search-view');
    });

    // Lida com cliques gerais no corpo da página (navegação, cards, etc.)
    document.body.addEventListener('click', e => {
        const viewTarget = e.target.closest('[data-view]');
        const cardTarget = e.target.closest('.profile-card');
        const bookBtnTarget = e.target.closest('.book-now-profile-btn');

        if (viewTarget) {
            e.preventDefault();
            showView(viewTarget.dataset.view);
        }
        if (cardTarget) {
            renderProfilePage(cardTarget.dataset.id);
        }
        if (bookBtnTarget) {
            currentBooking.professional = professionals.find(p => p.id === parseInt(bookBtnTarget.dataset.id));
            currentBooking.hours = selectedHours; // Usa as horas selecionadas no widget da home
            renderCheckoutPage();
        }
    });

    // Lida com a submissão do formulário de pagamento
    document.getElementById('payment-form').addEventListener('submit', e => {
        e.preventDefault();
        const cardName = document.getElementById('card-name').value;
        if (cardName) {
            alert(`Obrigado, ${cardName}! Seu agendamento foi confirmado com sucesso. (Isto é uma simulação)`);
            e.target.reset();
            showView('home-view');
        }
    });

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    renderSearchResults();
    updateBookingWidget();
    showView('home-view');
});
