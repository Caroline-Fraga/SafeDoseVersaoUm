// ======================================
//         1. CLASSE PRINCIPAL
// ======================================

// Sistema de Cálculo de Dosagem - implementado em português e com persistência no localStorage
class SistemaSafeDose {
    constructor() {
        // Mapeamento de unidades para conversão (mg / mL)
        this.conversoes = {
            'g': 1000,
            'mg': 1,
            'mcg': 0.001,
            'ml': 1,
            'l': 1000,
        };

        // Suporta duas chaves para migração: tenta recuperar histórico antigo se existir
        const historicoSalvo = localStorage.getItem('historicoDosagens') || localStorage.getItem('dosageHistory');
        this.historico = historicoSalvo ? JSON.parse(historicoSalvo) : [];

        // Limites de segurança (exemplos) — devem ser validados por profissional de saúde
        this.limitesSeguranca = {
            'dipirona': { max_dose: 4000, min_dose: 500, unidade: 'mg' },
            'paracetamol': { max_dose: 4000, min_dose: 500, unidade: 'mg' },
            'morfina': { max_dose: 30, unidade: 'mg' },
        };
    }

    // Converte valor para mg (ou para a unidade base definida)
    converterParaMg(valor, unidade) {
        if (!unidade) return valor;
        const key = unidade.toString().toLowerCase();
        return valor * (this.conversoes[key] || 1);
    }

    // Calcula a quantidade a administrar (retorna objeto com sucesso/erro)
    calcularDosagem(prescricaoValor, prescricaoUnidade, disponivelMassa, disponivelMassaUnidade, disponivelVolume, disponivelVolumeUnidade, forma, medicamento) {
        try {
            const prescricaoMg = this.converterParaMg(prescricaoValor, prescricaoUnidade);
            const massaDisponivelMg = this.converterParaMg(disponivelMassa, disponivelMassaUnidade);
            const volKey = disponivelVolumeUnidade ? disponivelVolumeUnidade.toString().toLowerCase() : 'ml';
            const volumeDisponivelMl = this.conversoes[volKey] ? disponivelVolume * this.conversoes[volKey] : disponivelVolume;

            if (!isFinite(massaDisponivelMg) || !isFinite(volumeDisponivelMl) || massaDisponivelMg <= 0 || volumeDisponivelMl <= 0) {
                return { resultado: 'Erro: Massa ou volume inválido (deve ser maior que zero).', sucesso: false };
            }

            const concentracao = massaDisponivelMg / volumeDisponivelMl; // mg por mL
            const quantidade = prescricaoMg / concentracao; // mL a administrar

            const formaLower = forma ? forma.toString().toLowerCase() : '';
            let resultadoTexto = '';

            if (formaLower === 'comprimido' || formaLower === 'comprimidos' || formaLower === 'capsula') {
                resultadoTexto = `Administrar ${quantidade.toFixed(2)} ${forma}`;
            } else if (formaLower === 'líquido' || formaLower === 'liquido' || formaLower === 'injeção' || formaLower === 'injeccao' || formaLower === 'solução') {
                resultadoTexto = `Administrar ${quantidade.toFixed(2)} mL de ${medicamento}`;
            } else {
                // Caso genérico — devolve em mL
                resultadoTexto = `Administrar ${quantidade.toFixed(2)} mL de ${medicamento}`;
            }

            return { resultado: resultadoTexto, sucesso: true, quantidade, prescricaoMg };
        } catch (err) {
            return { resultado: `Erro no cálculo: ${err.message}`, sucesso: false };
        }
    }

    // Verifica limites de segurança (retorna mensagem e tipo)
    verificarSeguranca(prescricaoMg, medicamento) {
        if (!medicamento) return { mensagem: 'Nenhum medicamento selecionado.', tipo: 'warning' };
        const limite = this.limitesSeguranca[medicamento.toString().toLowerCase()];
        if (limite) {
            if (limite.max_dose && prescricaoMg > limite.max_dose) {
                return { mensagem: `ALERTA: A dosagem prescrita excede ${limite.max_dose} ${limite.unidade}.`, tipo: 'warning' };
            }
            if (limite.min_dose && prescricaoMg < limite.min_dose) {
                return { mensagem: `ATENÇÃO: A dosagem prescrita está abaixo de ${limite.min_dose} ${limite.unidade}.`, tipo: 'warning' };
            }
        }
        return { mensagem: 'Dosagem dentro dos limites seguros.', tipo: 'success' };
    }

    // Histórico: adiciona, remove, salvar e obter
    adicionarHistorico(medicamento, prescricaoValor, prescricaoUnidade, disponivelMassa, disponivelMassaUnidade, disponivelVolume, disponivelVolumeUnidade, forma, resultado, alerta) {
        this.historico.unshift({
            id: Date.now(),
            medicamento,
            prescricaoValor,
            prescricaoUnidade,
            disponivelMassa,
            disponivelMassaUnidade,
            disponivelVolume,
            disponivelVolumeUnidade,
            forma,
            resultado,
            alerta,
        });
        this.salvarHistorico();
    }

    removerHistorico(id) {
        this.historico = this.historico.filter(item => item.id !== id);
        this.salvarHistorico();
    }

    salvarHistorico() {
        localStorage.setItem('historicoDosagens', JSON.stringify(this.historico));
    }

    obterHistorico() {
        return this.historico;
    }
}

// ======================================
//        2. GERENCIAMENTO DO DOM
// ======================================

document.addEventListener('DOMContentLoaded', () => {
    const sistema = new SistemaSafeDose();

    // Seleção segura de elementos do DOM (checa existência)
    const form = document.getElementById('formulario-dosagem');
    const resultBox = document.getElementById('result-content');
    const historyList = document.getElementById('history-list');

    const medicationError = document.getElementById('erro-medicamento');
    const prescribedDosageError = document.getElementById('erro-dosagem-prescrita');
    const availableConcentrationError = document.getElementById('erro-concentracao');
    const formError = document.getElementById('erro-forma');

    const customConfirmModal = document.getElementById('custom-confirm-modal');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    let itemIdToDelete = null;

    // Renderiza o histórico usando textContent (evita injeção)
    function renderizarHistorico() {
        if (!historyList) return;
        historyList.innerHTML = '';
        const historico = sistema.obterHistorico();
        if (!historico || historico.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-history-message';
            empty.textContent = 'Nenhum cálculo no histórico.';
            historyList.appendChild(empty);
            return;
        }

        historico.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = item.id;

            const details = document.createElement('div');
            details.className = 'history-item-details';

            const title = document.createElement('strong');
            title.textContent = `Medicamento: ${item.medicamento}`;

            const dosagem = document.createElement('small');
            dosagem.textContent = `Dosagem Prescrita: ${item.prescricaoValor} ${item.prescricaoUnidade}`;

            const concentracao = document.createElement('small');
            concentracao.textContent = `Concentração Disponível: ${item.disponivelMassa} ${item.disponivelMassaUnidade} / ${item.disponivelVolume} ${item.disponivelVolumeUnidade} (${item.forma})`;

            const resultado = document.createElement('span');
            resultado.textContent = item.resultado;

            details.appendChild(title);
            details.appendChild(dosagem);
            details.appendChild(concentracao);
            details.appendChild(resultado);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.setAttribute('aria-label', 'Excluir histórico');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';

            historyItem.appendChild(details);
            historyItem.appendChild(deleteBtn);
            historyList.appendChild(historyItem);
        });
    }

    renderizarHistorico();

    // Validação de entrada: mantém apenas números, ponto e vírgula
    function validarApenasNumeros(event) {
        const input = event.target;
        input.value = input.value.replace(/[^0-9.,]/g, '');
    }

    const dosagemInput = document.getElementById('dosagem-prescrita');
    const massaInput = document.getElementById('massa-disponivel');
    const volumeInput = document.getElementById('volume-disponivel');

    if (dosagemInput) dosagemInput.addEventListener('input', validarApenasNumeros);
    if (massaInput) massaInput.addEventListener('input', validarApenasNumeros);
    if (volumeInput) volumeInput.addEventListener('input', validarApenasNumeros);

    const medicamentoSelect = document.getElementById('medicamento-nome');
    const formaSelect = document.getElementById('forma-farmaceutica');

    if (medicamentoSelect && medicationError) medicamentoSelect.addEventListener('change', () => medicationError.textContent = '');
    if (formaSelect && formError) formaSelect.addEventListener('change', () => formError.textContent = '');
    if (massaInput && availableConcentrationError) massaInput.addEventListener('input', () => availableConcentrationError.textContent = '');
    if (volumeInput && availableConcentrationError) volumeInput.addEventListener('input', () => availableConcentrationError.textContent = '');

    function limparCampos() {
        if (medicamentoSelect) medicamentoSelect.selectedIndex = 0;
        if (dosagemInput) dosagemInput.value = '';
        if (massaInput) massaInput.value = '';
        if (volumeInput) volumeInput.value = '';
        if (formaSelect) formaSelect.selectedIndex = 0;
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (medicationError) medicationError.textContent = '';
            if (prescribedDosageError) prescribedDosageError.textContent = '';
            if (availableConcentrationError) availableConcentrationError.textContent = '';
            if (formError) formError.textContent = '';

            const medicamento = medicamentoSelect ? medicamentoSelect.value : '';
            const prescribedDosageValue = dosagemInput ? dosagemInput.value : '';
            const availableMassValue = massaInput ? massaInput.value : '';
            const availableVolumeValue = volumeInput ? volumeInput.value : '';

            const prescricaoValor = prescribedDosageValue ? parseFloat(prescribedDosageValue.replace(',', '.')) : NaN;
            const disponivelMassa = availableMassValue ? parseFloat(availableMassValue.replace(',', '.')) : NaN;
            const disponivelVolume = availableVolumeValue ? parseFloat(availableVolumeValue.replace(',', '.')) : NaN;

            const prescricaoUnidade = document.getElementById('unidade-prescrita') ? document.getElementById('unidade-prescrita').value : 'mg';
            const disponivelMassaUnidade = document.getElementById('unidade-massa-disponivel') ? document.getElementById('unidade-massa-disponivel').value : 'mg';
            const disponivelVolumeUnidade = document.getElementById('unidade-volume-disponivel') ? document.getElementById('unidade-volume-disponivel').value : 'ml';
            const forma = formaSelect ? formaSelect.value : '';

            let temErro = false;

            if (!medicamento) {
                if (medicationError) medicationError.textContent = 'Selecione o medicamento.';
                temErro = true;
            }
            if (isNaN(prescricaoValor) || prescricaoValor <= 0) {
                if (prescribedDosageError) prescribedDosageError.textContent = 'Insira um valor numérico válido para a dosagem (maior que 0).';
                temErro = true;
            }
            if (isNaN(disponivelMassa) || disponivelMassa <= 0 || isNaN(disponivelVolume) || disponivelVolume <= 0) {
                if (availableConcentrationError) availableConcentrationError.textContent = 'Insira valores numéricos válidos para a concentração (maiores que 0).';
                temErro = true;
            }
            if (!forma) {
                if (formError) formError.textContent = 'Selecione a forma farmacêutica.';
                temErro = true;
            }

            if (temErro) return;

            const resultadoObj = sistema.calcularDosagem(
                prescricaoValor,
                prescricaoUnidade,
                disponivelMassa,
                disponivelMassaUnidade,
                disponivelVolume,
                disponivelVolumeUnidade,
                forma,
                medicamento
            );

            exibirResultado(resultadoObj.resultado, resultadoObj.sucesso);

            if (resultadoObj.sucesso) {
                const alerta = sistema.verificarSeguranca(resultadoObj.prescricaoMg, medicamento);
                exibirAlerta(alerta.mensagem, alerta.tipo);
                sistema.adicionarHistorico(
                    medicamento,
                    prescricaoValor,
                    prescricaoUnidade,
                    disponivelMassa,
                    disponivelMassaUnidade,
                    disponivelVolume,
                    disponivelVolumeUnidade,
                    forma,
                    resultadoObj.resultado,
                    alerta.mensagem
                );
                renderizarHistorico();
                limparCampos();
            } else {
                exibirAlerta(resultadoObj.resultado, 'error');
            }
        });
    }

    // Remover item do histórico via delegação de eventos
    if (historyList) {
        historyList.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-btn');
            if (btn) {
                const itemElement = btn.closest('.history-item');
                if (itemElement) {
                    itemIdToDelete = parseInt(itemElement.dataset.id, 10);
                    if (customConfirmModal) customConfirmModal.classList.remove('hidden');
                }
            }
        });
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (itemIdToDelete) {
                sistema.removerHistorico(itemIdToDelete);
                renderizarHistorico();
                itemIdToDelete = null;
            }
            if (customConfirmModal) customConfirmModal.classList.add('hidden');
        });
    }

    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', () => {
            itemIdToDelete = null;
            if (customConfirmModal) customConfirmModal.classList.add('hidden');
        });
    }

    if (customConfirmModal) {
        customConfirmModal.addEventListener('click', (e) => {
            if (e.target === customConfirmModal) {
                itemIdToDelete = null;
                customConfirmModal.classList.add('hidden');
            }
        });
    }

    // Exibe resultado de forma segura (sem innerHTML de conteúdo do usuário)
    function exibirResultado(texto, sucesso) {
        if (!resultBox) return;
        resultBox.innerHTML = '';

        const icon = document.createElement('i');
        icon.className = 'fas ' + (sucesso ? 'fa-check-circle' : 'fa-exclamation-circle');
        icon.setAttribute('aria-hidden', 'true');
        icon.style.color = sucesso ? 'var(--result-success)' : 'var(--alert-error)';

        const textoEl = document.createElement('div');
        textoEl.className = 'result-text';
        textoEl.textContent = texto;

        resultBox.appendChild(icon);
        resultBox.appendChild(textoEl);

        if (sucesso) {
            const safety = document.createElement('div');
            safety.className = 'safety-message';
            safety.textContent = 'Verifique o alerta de segurança abaixo.';
            resultBox.appendChild(safety);
        }
    }

    // Exibe alerta de segurança/formulário
    function exibirAlerta(mensagem, tipo) {
        const resultPanel = document.querySelector('.panel.result');
        if (!resultPanel) return;

        const existing = document.getElementById('safety-alert-box');
        if (existing) existing.remove();

        const alertBox = document.createElement('div');
        alertBox.id = 'safety-alert-box';
        alertBox.className = `safety-alert-box ${tipo}`;

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle';
        icon.setAttribute('aria-hidden', 'true');

        const msg = document.createElement('span');
        msg.id = 'safety-alert-message';
        msg.textContent = mensagem;

        alertBox.appendChild(icon);
        alertBox.appendChild(msg);

        resultPanel.appendChild(alertBox);
    }
});
