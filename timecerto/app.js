// Usuário fixo e dados temporários compartilhados pelas três páginas.
const NOME_USUARIO = 'Lucas Augusto';
const CHAVE_DADOS = 'timecerto-tres-telas-v1';
const exemplos = [
    {
        id: '1',
        titulo: 'Racha de sábado',
        esporte: 'Futebol',
        local: 'Quadra Central, Centro',
        data: '2026-11-28',
        horario: '19:00',
        nivel: 'Intermediário',
        capacidade: 10,
        jogadores: 8,
        preco: 15,
        descricao: 'Jogo casual para reunir a turma e se divertir.',
        participantes: [],
        criada: false
    },
    {
        id: '2',
        titulo: 'Vôlei de quinta',
        esporte: 'Vôlei',
        local: 'Ginásio Municipal, Bairro Norte',
        data: '2026-11-26',
        horario: '20:00',
        nivel: 'Iniciante',
        capacidade: 12,
        jogadores: 8,
        preco: 0,
        descricao: 'Partida amistosa de vôlei. Todos são bem-vindos!',
        participantes: [],
        criada: false
    },
    {
        id: '3',
        titulo: '3x3 de domingo',
        esporte: 'Basquete',
        local: 'Praça Esportiva',
        data: '2026-11-29',
        horario: '10:00',
        nivel: 'Intermediário',
        capacidade: 6,
        jogadores: 3,
        preco: 0,
        descricao: 'Basquete entre amigos na quadra da praça.',
        participantes: [],
        criada: false
    }
];
let partidas = exemplos;
try {
    const salvas = sessionStorage.getItem(CHAVE_DADOS);
    if (salvas) partidas = JSON.parse(salvas);
    if (!Array.isArray(partidas)) partidas = exemplos;
} catch {
    partidas = exemplos;
}

// 1. Cria uma partida, guarda os dados e abre a mesma tela de confirmação.
function criarPartida(evento) {
    evento.preventDefault();
    const formulario = document.getElementById('formulario-partida');
    const erro = document.getElementById('erro-criacao');
    erro.innerText = '';
    const titulo = formulario.elements['titulo'].value.trim();
    const local = formulario.elements['local'].value.trim();
    if (titulo === '' || local === '') {
        erro.innerText = 'Preencha o nome da partida e o local.';
        return;
    }
    const partida = {
        id: String(partidas.length + 1),
        titulo: titulo,
        esporte: formulario.elements['esporte'].value,
        local: local,
        data: formulario.elements['data'].value,
        horario: formulario.elements['horario'].value,
        nivel: formulario.elements['nivel'].value,
        capacidade: +formulario.elements['capacidade'].value,
        jogadores: 0,
        preco: +formulario.elements['preco'].value,
        descricao: formulario.elements['descricao'].value.trim(),
        participantes: [],
        criada: true
    };
    if (partida.capacidade < 2 || partida.capacidade > 200 || partida.preco < 0) {
        erro.innerText = 'Informe de 2 a 200 vagas e um valor válido.';
        return;
    }
    partidas.push(partida);
    sessionStorage.setItem(CHAVE_DADOS, JSON.stringify(partidas));
    location.href = 'confirmacao.html#' + partida.id;
}

// 2. Confirma Lucas sozinho ou Lucas e um acompanhante na partida selecionada.
function confirmarParticipacao(evento) {
    const mensagem = document.getElementById('mensagem-confirmacao');
    const campo = document.getElementById('campo-acompanhante');
    const entrada = document.getElementById('nome-acompanhante');
    const dupla = evento.currentTarget.getAttribute('data-dupla') === 'sim';
    mensagem.className = 'mensagem erro';
    if (dupla && campo.hidden) {
        campo.hidden = false;
        entrada.focus();
        mensagem.innerText = 'Preencha o nome da outra pessoa e clique novamente para confirmar.';
        return;
    }
    let acompanhante = '';
    if (dupla) {
        acompanhante = entrada.value.trim();
        if (acompanhante === '' || acompanhante.length > 80) {
            mensagem.innerText = 'Informe o nome da outra pessoa (até 80 caracteres).';
            entrada.focus();
            return;
        }
        if (acompanhante.toLowerCase() === NOME_USUARIO.toLowerCase()) {
            mensagem.innerText = 'O acompanhante deve ter um nome diferente do seu.';
            return;
        }
    }
    let partida = null;
    for (let item of partidas) if (item.id === location.hash.slice(1)) partida = item;
    if (!partida) return;
    let usuarioConfirmado = false,
        acompanhanteConfirmado = false;
    for (let nome of partida.participantes) {
        if (nome.toLowerCase() === NOME_USUARIO.toLowerCase()) usuarioConfirmado = true;
        if (dupla && nome.toLowerCase() === acompanhante.toLowerCase())
            acompanhanteConfirmado = true;
    }
    let novasVagas = 0;
    if (!usuarioConfirmado) novasVagas++;
    if (dupla && !acompanhanteConfirmado) novasVagas++;
    if (novasVagas === 0) {
        mensagem.innerText = dupla
            ? 'Esses nomes já estão confirmados nesta partida.'
            : 'Você já está confirmado nesta partida.';
        return;
    }
    if (partida.capacidade - partida.jogadores < novasVagas) {
        mensagem.innerText = dupla
            ? 'Não há vagas suficientes para essa confirmação. Nenhuma reserva foi alterada.'
            : 'Esta partida está lotada.';
        return;
    }
    // Só altera a lista depois de conferir todos os nomes e todas as vagas.
    if (!usuarioConfirmado) partida.participantes.push(NOME_USUARIO);
    if (dupla && !acompanhanteConfirmado) partida.participantes.push(acompanhante);
    partida.jogadores += novasVagas;
    sessionStorage.setItem(CHAVE_DADOS, JSON.stringify(partidas));
    document.getElementById('lista-participantes').innerHTML = '';
    for (let nome of partida.participantes) {
        const pessoa = document.createElement('li');
        pessoa.innerText = nome;
        document.getElementById('lista-participantes').appendChild(pessoa);
    }
    document.getElementById('aviso-lista').innerText = 'Nomes confirmados nesta demonstração:';
    document.getElementById('vagas-confirmacao').innerText =
        partida.capacidade - partida.jogadores + ' vagas disponíveis';
    mensagem.className = 'mensagem sucesso';
    mensagem.innerText = dupla
        ? 'Presença de ' + NOME_USUARIO + ' e ' + acompanhante + ' confirmada!'
        : 'Sua presença está confirmada, ' + NOME_USUARIO + '!';
    campo.hidden = true;
    entrada.value = '';
}

// 3. Pesquisa os exemplos disponíveis e atualiza as listas pessoais do Início.
function pesquisarPartidas(evento = null) {
    if (evento) evento.preventDefault();
    const formulario = document.getElementById('form-pesquisa');
    if (!formulario) return;
    const busca = formulario.elements['pesquisa'].value.trim().toLowerCase();
    const esporte = formulario.elements['esporte'].value;
    const nivel = formulario.elements['nivel'].value;
    const data = formulario.elements['data'].value;
    const disponiveis = document.getElementById('partidas-disponiveis');
    const minhas = document.getElementById('minhas-partidas');
    const criadas = document.getElementById('partidas-criadas');
    disponiveis.innerHTML = '';
    minhas.innerHTML = '';
    criadas.innerHTML = '';
    let total = 0;
    let totalCriadas = 0;
    for (let partida of partidas) {
        if (partida.criada) totalCriadas++;
        let participando = false;
        for (let nome of partida.participantes) if (nome === NOME_USUARIO) participando = true;
        const vagas = partida.capacidade - partida.jogadores;
        const corresponde =
            (busca === '' ||
                (partida.titulo + ' ' + partida.local).toLowerCase().indexOf(busca) !== -1) &&
            (esporte === '' || esporte === partida.esporte) &&
            (nivel === '' || nivel === partida.nivel) &&
            (data === '' || data === partida.data);
        // O mesmo registro pode aparecer em uma lista pessoal e na lista de exemplos.
        for (let lista of [disponiveis, minhas, criadas]) {
            let exibir = false;
            if (lista === disponiveis && !partida.criada && vagas > 0 && corresponde) exibir = true;
            if (lista === minhas && participando) exibir = true;
            if (lista === criadas && partida.criada && corresponde) exibir = true;
            if (exibir) {
                const cartao = document.createElement('article');
                cartao.className =
                    lista === disponiveis ? 'cartao-partida' : 'painel linha-partida';
                if (lista === disponiveis) {
                    cartao.innerHTML =
                        '<img class="banner" alt=""><div class="conteudo-cartao"><div class="topo-cartao"><span class="etiqueta"></span><span class="vagas"></span></div><h3></h3><p class="local texto-suave"></p><p class="horario texto-suave"></p><p class="nivel texto-suave"></p><a class="botao">Ver partida</a></div>';
                    let banner = 'imagens/capa-futebol.svg';
                    if (partida.esporte === 'Vôlei') banner = 'imagens/capa-volei.svg';
                    if (partida.esporte === 'Basquete') banner = 'imagens/capa-basquete.svg';
                    cartao.querySelector('img').src = banner;
                    cartao.querySelector('img').alt = 'Ilustração de quadra de ' + partida.esporte;
                    cartao.querySelector('.etiqueta').innerText = partida.esporte;
                    cartao.querySelector('.vagas').innerText = vagas + ' vagas';
                    cartao.querySelector('.nivel').innerText =
                        partida.nivel +
                        ' · ' +
                        (partida.preco === 0 ? 'Grátis' : 'R$ ' + partida.preco);
                    total++;
                } else {
                    cartao.innerHTML =
                        '<div class="resumo-partida"><span class="etiqueta"></span><h3></h3><p class="local texto-suave"></p><p class="horario texto-suave"></p></div><a class="botao secundario">Ver detalhes</a>';
                    cartao.querySelector('.etiqueta').innerText = partida.esporte;
                }
                cartao.querySelector('h3').innerText = partida.titulo;
                cartao.querySelector('.local').innerText = partida.local;
                const partesData = partida.data.split('-');
                cartao.querySelector('.horario').innerText =
                    partesData[2] +
                    '/' +
                    partesData[1] +
                    '/' +
                    partesData[0] +
                    ' às ' +
                    partida.horario;
                cartao.querySelector('a').href = 'views/confirmacao.html#' + partida.id;
                lista.appendChild(cartao);
            }
        }
    }
    document.getElementById('total-resultados').innerText =
        total + (total === 1 ? ' partida encontrada' : ' partidas encontradas');
    if (!disponiveis.childElementCount)
        disponiveis.innerHTML =
            '<p class="painel vazio">Nenhuma partida com vagas para esses filtros.</p>';
    if (!minhas.childElementCount)
        minhas.innerHTML =
            '<p class="painel vazio">Você ainda não confirmou presença em nenhuma partida.</p>';
    if (!criadas.childElementCount) {
        criadas.innerHTML = totalCriadas
            ? '<p class="painel vazio">Nenhuma partida criada por você para esses filtros.</p>'
            : '<p class="painel vazio">Você ainda não criou uma partida.</p>';
    }
}

// Inicialização das três páginas, sem criar uma quarta função.
for (let nome of document.querySelectorAll('.nome-usuario')) nome.innerText = NOME_USUARIO;
if (document.body.getAttribute('data-pagina') === 'inicio') pesquisarPartidas();
if (document.body.getAttribute('data-pagina') === 'confirmacao') {
    let selecionada = null;
    for (let partida of partidas) if (partida.id === location.hash.slice(1)) selecionada = partida;
    if (!selecionada) document.getElementById('partida-nao-encontrada').hidden = false;
    else {
        document.getElementById('detalhes-partida').hidden = false;
        let banner = '../imagens/capa-futebol.svg';
        if (
            selecionada.esporte === 'Vôlei' ||
            selecionada.esporte === 'Futevôlei' ||
            selecionada.esporte === 'Beach tennis'
        )
            banner = '../imagens/capa-volei.svg';
        if (selecionada.esporte === 'Basquete') banner = '../imagens/capa-basquete.svg';
        document.getElementById('banner-confirmacao').src = banner;
        document.getElementById('banner-confirmacao').alt =
            'Ilustração de quadra de ' + selecionada.esporte;
        document.getElementById('titulo-confirmacao').innerText = selecionada.titulo;
        document.getElementById('esporte-confirmacao').innerText = selecionada.esporte;
        document.getElementById('organizador-confirmacao').innerText =
            'Organizado por ' + (selecionada.criada ? NOME_USUARIO : 'Comunidade TimeCerto');
        document.getElementById('local-confirmacao').innerText = selecionada.local;
        const data = selecionada.data.split('-');
        document.getElementById('data-confirmacao').innerText =
            data[2] + '/' + data[1] + '/' + data[0] + ' às ' + selecionada.horario;
        document.getElementById('nivel-confirmacao').innerText = selecionada.nivel;
        document.getElementById('preco-confirmacao').innerText =
            selecionada.preco === 0 ? 'Grátis' : 'R$ ' + selecionada.preco;
        document.getElementById('descricao-confirmacao').innerText =
            selecionada.descricao || 'O organizador não adicionou uma descrição.';
        document.getElementById('vagas-confirmacao').innerText =
            selecionada.capacidade - selecionada.jogadores + ' vagas disponíveis';
        document.getElementById('aviso-lista').innerText = selecionada.participantes.length
            ? 'Nomes confirmados nesta demonstração:'
            : 'Nenhum nome confirmado nesta demonstração ainda.';
        for (let nome of selecionada.participantes) {
            const pessoa = document.createElement('li');
            pessoa.innerText = nome;
            document.getElementById('lista-participantes').appendChild(pessoa);
        }
    }
}
