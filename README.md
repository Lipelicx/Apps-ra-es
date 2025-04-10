<!DOCTYPE html><html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Controle de Rações</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 0 10px;
    }
    h1 {
      text-align: center;
      margin-top: 15px;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    input, select {
      width: 100%;
      padding: 8px;
      margin: 5px 0;
      border-radius: 5px;
      border: none;
    }
    .btn {
      padding: 10px;
      margin: 5px 2px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .btn-add {
      background-color: #ea580c;
      color: white;
    }
    .btn-edit {
      background-color: #3b82f6;
      color: white;
    }
    .btn-remove {
      background-color: #ef4444;
      color: white;
    }
    .racao {
      background-color: #1e293b;
      padding: 10px;
      margin: 10px 0;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .economia {
      color: #22c55e;
    }
    .filtros {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Controle de Rações</h1><div class="filtros">
  <input type="text" id="pesquisa" placeholder="Pesquisar por nome..." oninput="renderizarRacoes()">
  <select id="filtro" onchange="renderizarRacoes()">
    <option value="">Sem filtro</option>
    <option value="menor">Menor Preço</option>
    <option value="nome">Nome (A-Z)</option>
    <option value="popular">Mais Pesquisadas</option>
  </select>
</div>

<input type="text" id="nome" placeholder="Nome da ração">
<input type="number" id="preco" placeholder="Preço pacote fechado (R$)">
<input type="number" id="peso" placeholder="Peso (kg ou gramas)">
<input type="number" id="granel" placeholder="Preço por kg (granel - opcional)">
<button class="btn btn-add" onclick="adicionarRacao()">Adicionar</button>

<div id="lista"></div>

  </div>  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>  <script>
    const firebaseConfig = {
      apiKey: "AIzaSyDPjSmBBiy1ra_H9-5eCwEANIGcpibjY4k",
      authDomain: "prosutospetsapp.firebaseapp.com",
      databaseURL: "https://prosutospetsapp-default-rtdb.firebaseio.com",
      projectId: "prosutospetsapp",
      storageBucket: "prosutospetsapp.appspot.com",
      messagingSenderId: "302675094125",
      appId: "1:302675094125:web:8e788d4f04ec8f3374ad64"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    let racoes = {};
    let edicaoId = null;
    let pesquisas = {};

    function adicionarRacao() {
      const nome = document.getElementById('nome').value.trim();
      const preco = parseFloat(document.getElementById('preco').value);
      let peso = parseFloat(document.getElementById('peso').value);
      const granel = parseFloat(document.getElementById('granel').value);
      if (!nome || isNaN(preco) || isNaN(peso)) return;
      peso = peso >= 10 ? peso : peso / 1000;

      const nova = { nome, preco, peso, granel: isNaN(granel) ? null : granel };
      if (edicaoId) {
        db.ref('racoes/' + edicaoId).set(nova);
        edicaoId = null;
      } else {
        const id = Date.now();
        db.ref('racoes/' + id).set(nova);
      }
      document.getElementById('nome').value = '';
      document.getElementById('preco').value = '';
      document.getElementById('peso').value = '';
      document.getElementById('granel').value = '';
    }

    function removerRacao(id) {
      db.ref('racoes/' + id).remove();
    }

    function editarRacao(id) {
      const r = racoes[id];
      document.getElementById('nome').value = r.nome;
      document.getElementById('preco').value = r.preco;
      document.getElementById('peso').value = r.peso;
      document.getElementById('granel').value = r.granel || '';
      edicaoId = id;
    }

    function renderizarRacoes() {
      const lista = document.getElementById('lista');
      lista.innerHTML = '';
      const termo = document.getElementById('pesquisa').value.toLowerCase();
      const filtro = document.getElementById('filtro').value;

      let arr = Object.entries(racoes);
      if (termo) {
        arr = arr.filter(([id, r]) => r.nome.toLowerCase().includes(termo));
        if (termo.length > 2) pesquisas[termo] = (pesquisas[termo] || 0) + 1;
      }
      if (filtro === 'menor') arr.sort((a,b)=>a[1].preco - b[1].preco);
      else if (filtro === 'nome') arr.sort((a,b)=>a[1].nome.localeCompare(b[1].nome));
      else if (filtro === 'popular') arr.sort((a,b)=>((pesquisas[b[1].nome.toLowerCase()]||0)-(pesquisas[a[1].nome.toLowerCase()]||0)));

      arr.forEach(([id, r]) => {
        const div = document.createElement('div');
        div.className = 'racao';
        let html = `<strong>${r.nome}</strong><br>
          Preço: R$ ${r.preco.toFixed(2)}<br>
          Peso: ${r.peso}kg<br>`;
        if (r.granel) {
          const economia = (r.granel * r.peso) - r.preco;
          html += `Granel: R$ ${r.granel.toFixed(2)}<br>
                   <span class="economia">Economia: R$ ${economia.toFixed(2)}</span><br>`;
        } else {
          html += `Sem preço granel<br>`;
        }
        html += `<button class='btn btn-edit' onclick="editarRacao('${id}')">Editar</button>
                 <button class='btn btn-remove' onclick="removerRacao('${id}')">Remover</button>`;
        div.innerHTML = html;
        lista.appendChild(div);
      });
    }

    db.ref('racoes').on('value', snapshot => {
      racoes = snapshot.val() || {};
      renderizarRacoes();
    });
  </script></body>
</html>