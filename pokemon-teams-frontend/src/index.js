const BASE_URL = "http://localhost:3000";
const TRAINERS_URL = `${BASE_URL}/trainers`;
const POKEMONS_URL = `${BASE_URL}/pokemons`;

document.addEventListener("DOMContentLoaded", () => {
  displayTrainers();
});
function displayTrainers() {
  fetch(TRAINERS_URL)
    .then(e => e.json())
    .then(trainers =>
      trainers.forEach(trainer => {
        makeCard(trainer);
      })
    );
}

function findTrainerAnd(id, cb) {
  let ret = false;
  fetch(TRAINERS_URL)
    .then(e => e.json())
    .then(trainers => {
      ret = trainers.find(tr => {
        console.log(tr.id);
        return parseInt(tr.id) === parseInt(id);
      });
    })
    .then(() => {
      if (!ret) {
        throw `Trainer ${id} not Found`;
      } else {
        console.log(ret);
        cb(ret);
      }
    });
}

function makeCard(trainer) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = trainer.id;
  card.innerHTML = `<p>${trainer.name}</p>`;
  if (trainer.pokemons.length < 6) {
    const but = document.createElement("button");
    card.appendChild(but);
    but.className = "add";
    but.dataset.id = card.dataset.id;
    but.innerHTML = "Add Pokemon";
    but.addEventListener("click", () => {
      addPokemon(card, trainer);
    });
  }
  const list = document.createElement("ul");
  card.appendChild(list);
  listPokemon(card, trainer);
  const main = document.querySelector("main");
  main.appendChild(card);
}
function listPokemon(card, trainer) {
  console.log(trainer);
  const pokeList = card.querySelector("ul");
  pokeList.innerHTML = "";
  trainer.pokemons.forEach(pokemon => {
    const entry = document.createElement("li");
    entry.innerHTML = `${pokemon.nickname}(${pokemon.species})<button class= "release" data-pokemon-id = ${pokemon.species}>Release</button>`;
    const release = entry.querySelector("button");
    release.addEventListener("click", () => {
      removePokemon(card, trainer, pokemon);
    });
    pokeList.appendChild(entry);
  });
}

function findTrainerAndListPokemon(card, id) {
  listWithFound = found => listPokemon(card, found);
  findTrainerAnd(id, listWithFound);
}
function findTrainerAndValidatePokeNumber(card, id) {
  let button = card.querySelector("button.add");
  findTrainerAnd(id, trainer => {
    if (trainer.pokemons.length >= 6) {
      button.remove();
    } else {
      if (!button) {
        console.log("should be a button");
        list = card.querySelector("ul");
        button = document.createElement("button");
        card.insertBefore(button, list);
        button.className = "add";
        button.dataset.id = card.dataset.id;
        button.innerHTML = "Add Pokemon";
        button.addEventListener("click", () => {
          addPokemon(card, trainer);
        });
      }
    }
  });
}

function addPokemon(card, trainer) {
  const form = document.createElement("form");
  form.innerHTML = `<input type="text" name="nickname" placeholder="Nickname"><input type="text" name="species" placeholder="species"><input type = "submit" name = "submit">`;
  form.addEventListener("submit", e => {
    e.preventDefault();
    let id = trainer.id;
    let name = e.target.elements.nickname.value;
    let species = e.target.elements.species.value;

    newMon = { trainer_id: id, nickname: name, species: species };
    console.log(newMon);

    fetch(POKEMONS_URL, {
      method: "POST",
      headers: { "Content-type": "Application/json" },
      body: JSON.stringify(newMon)
    })
      .then(e => console.log(e))
      .then(() => form.remove())
      .then(() => findTrainerAndListPokemon(card, id))
      .then(() => findTrainerAndValidatePokeNumber(card, id));
  });
  const list = card.querySelector("ul");
  card.insertBefore(form, list);
}

function removePokemon(card, trainer, pokemon) {
  fetch(POKEMONS_URL + `/${pokemon.id}`, {
    method: "DELETE"
  })
    .then(e => console.log(e))
    .then(() => findTrainerAndListPokemon(card, trainer.id))
    .then(() => findTrainerAndValidatePokeNumber(card, trainer.id));
}
