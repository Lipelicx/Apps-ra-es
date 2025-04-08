
const nome = document.getElementById('nome');
const preco = document.getElementById('preco');
const peso = document.getElementById('peso');
const granel = document.getElementById('granel');
const racoesContainer = document.getElementById('racoes');
let racaoEditando = null;

import { db, ref, push, onValue, remove, update } from "./firebase.js";

document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("claro");
};

function calcularEconomia(preco, peso, granel) {
  if (!granel) return null;
  const granelTotal = granel * peso;
  return preco - granelTotal;
}

function renderizarRacoes(racoes) {
  racoesContainer.innerHTML = '';
  racoes.forEach(racao => {
    const div = document.createElement('div');
    div.className = 'racao';
    div.innerHTML = `
      <strong>${racao.nome}</strong><br>
      Preço: R$ ${parseFloat(racao.preco).toFixed(2)}<br>
      Peso: ${parseFloat(racao.peso).toFixed(2)}kg<br>
      ${racao.granel ? `Granel: R$ ${parseFloat(racao.granel).toFixed(2)}<br>
      <span class="economia">Economia: R$ ${calcularEconomia(racao.preco, racao.peso, racao.granel).toFixed(2)}</span><br>` : "Sem preço granel<br>"}
      <button onclick="editarRacao('${racao.id}')">Editar</button>
      <button onclick="removerRacao('${racao.id}')">Remover</button>
    `;
    racoesContainer.appendChild(div);
  });
}

window.adicionarRacao = function () {
  const novaRacao = {
    nome: nome.value,
    preco: parseFloat(preco.value),
    peso: parseFloat(peso.value),
    granel: granel.value ? parseFloat(granel.value) : null,
  };

  if (racaoEditando) {
    update(ref(db, 'racoes/' + racaoEditando), novaRacao);
    racaoEditando = null;
  } else {
    push(ref(db, 'racoes'), novaRacao);
  }

  nome.value = '';
  preco.value = '';
  peso.value = '';
  granel.value = '';
};

window.editarRacao = function (id) {
  const racao = racoes.find(r => r.id === id);
  if (racao) {
    nome.value = racao.nome;
    preco.value = racao.preco;
    peso.value = racao.peso;
    granel.value = racao.granel ?? '';
    racaoEditando = id;
  }
};

window.removerRacao = function (id) {
  remove(ref(db, 'racoes/' + id));
};

let racoes = [];
onValue(ref(db, 'racoes'), snapshot => {
  racoes = [];
  snapshot.forEach(child => {
    racoes.push({ id: child.key, ...child.val() });
  });
  renderizarRacoes(racoes);
});
