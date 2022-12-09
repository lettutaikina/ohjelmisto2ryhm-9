'use strict';
/* 1. show map using Leaflet library. (L comes from the Leaflet library) */

const map = L.map('map', { tap: false });
L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  attribution: 'Stamen',
  maxZoom: 10,
}).addTo(map);
map.setView([60, 24], 4);

// global variables
const apiUrl = 'http://127.0.0.1:5000/';
const startLoc = 'EFHK';
const globalGoals = [];
const airportMarkers = L.featureGroup().addTo(map);

// icons
const blueIcon = L.divIcon({ className: 'blue-icon' });
const greenIcon = L.divIcon({ className: 'green-icon' });

// form for player name
document.querySelector('#player-form').addEventListener('submit', function (evt) {
  evt.preventDefault();
  const playerName = document.querySelector('#player-input').value;
  document.querySelector('#player-modal').classList.add('hide');
  gameSetup(`${apiUrl}newgame?player=${playerName}&loc=${startLoc}`);
});

// function to fetch data from API
async function getData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Invalid server input!');
  const data = await response.json();
  return data;
}

// function to update game status
function updateStatus(status) {
  document.querySelector('#player-name').innerHTML = `Player: ${status.status.name}`;
  document.querySelector('#visited').innerHTML = `${status.visited}/${status.end}`;
  document.querySelector('#consumed').innerHTML = status.status.co2.consumed;
  document.querySelector('#budget').innerHTML = status.status.co2.budget;
}

// function to show weather at selected airport
function showWeather(airport) {
  document.querySelector('#airport-name').innerHTML = `Weather at ${airport.name}`;
  document.querySelector('#airport-temp').innerHTML = `${airport.weather.temp}°C`;
  document.querySelector('#weather-icon').src = airport.weather.icon;
  document.querySelector('#airport-conditions').innerHTML = airport.weather.description;
  document.querySelector('#airport-wind').innerHTML = `${airport.weather.wind.speed}m/s`;
}

// function to get weather icon

async function showWeatherOnIcon(airport) {

        const iconData = await getData(`${apiUrl}icondata?icon=${airport.ident}`)
        console.log(iconData);
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = iconData.weather.icon;
        img.alt = "Marker weather icon";
        const figcaption = document.createElement('figcaption');
        figcaption.innerHTML = iconData.weather.description;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        return figure;
}

// function to check if any goals have been reached
function checkGoals(meets_goals) {
  if (meets_goals.length > 0) {
    for (let goal of meets_goals) {
      if (!globalGoals.includes(goal)) {
        document.querySelector('.goal').classList.remove('hide');
        location.href = '#goals';
      }
    }
  }
}

// function to update goal data and goal table in UI
function updateGoals(goals) {
  document.querySelector('#goals').innerHTML = '';
  for (let goal of goals) {
    const li = document.createElement('li');
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    const figcaption = document.createElement('figcaption');
    img.src = goal.icon;
    img.alt = `goal name: ${goal.name}`;
    figcaption.innerHTML = goal.description;
    figure.append(img);
    figure.append(figcaption);
    li.append(figure);
    if (goal.reached) {
      li.classList.add('done');
      globalGoals.includes(goal.goalid) || globalGoals.push(goal.goalid);
    }
    document.querySelector('#goals').append(li);
  }
}

// function to get minigame (Max)

async function minigame(airport) {
  const minigameData = await getData(`${apiUrl}minigame?loc=${airport.ident}`)
  console.log(minigameData);
  let reward = 0;

  if (minigameData.game === 1) {
    console.log("hello")
    const dialog = document.getElementById("minigame1");
    const h3 = document.querySelector("#minigame1 h3");
    const p = document.querySelector("#minigame1 p");
    const buttons = [];
    buttons.push(document.getElementById("small"), document.getElementById("medium"), document.getElementById("large"));
    h3.innerHTML = minigameData.airport1.name;
    for (let button of buttons){
      button.addEventListener('click', function(){
        if (button.value === minigameData.size){
          reward = minigameData.game_reward;
          p.innerHTML = "Correct!";
        } else {
          p.innerHTML = "Incorrect!";
        }
        console.log(reward);
        setTimeout(closeDialog, 3000, dialog, p);
      });
    }
    dialog.showModal();
    }

  function closeDialog(dialog, p){
    dialog.close();
    p.innerHTML = "";
    return reward;
  }
    if (minigameData.game === 1) {
    console.log("hello")
    const dialog = document.getElementById("minigame1");
    const h3 = document.querySelector("#minigame1 h3");
    const p = document.querySelector("#minigame1 p");
    const buttons = [];
    buttons.push(document.getElementById("small"), document.getElementById("medium"), document.getElementById("large"));
    h3.innerHTML = minigameData.airport1.name;
    for (let button of buttons){
      button.addEventListener('click', function(){
        if (button.value === minigameData.size){
          reward = minigameData.game_reward;
          p.innerHTML = "Correct!";
        } else {
          p.innerHTML = "Incorrect!";
        }
        console.log(reward);
        setTimeout(closeDialog, 3000, dialog, p);
      });
    }
    dialog.showModal();
    }

    if (minigameData.game === 2) {
    console.log("hello2")
    const dialog = document.getElementById("minigame2");
    const h3_a1 = document.getElementById("airport1");
    const h3_a2 = document.getElementById("airport2");
    const p = document.querySelector("#minigame2 p");
    const buttons = [];
    buttons.push(document.getElementById("1"), document.getElementById("2"));
    h3_a1.innerText = minigameData.airport1.name;
    h3_a2.innerText = minigameData.airport2.name;
    for (let button of buttons){
      console.log(minigameData.distance)
      button.addEventListener('click', function(){
        if (parseInt(button.value) === minigameData.distance){
          reward = minigameData.game_reward;
          p.innerHTML = "Correct!";
        } else {
          p.innerHTML = "Incorrect!";
        }
        console.log(reward);
        setTimeout(closeDialog, 3000, dialog, p);
      });
    }
    dialog.showModal();
    }

  function closeDialog(dialog, p){
    dialog.close();
    p.innerHTML = "";
    return reward;
  }
  }

// function to check if game is over
function checkGameOver(gamedata) {
  if (gamedata.goal) {
    alert(`You've won!`);
    return false;
  }
  if (gamedata.status.co2.budget <= 0) {
    alert(`Game Over. ${globalGoals.length} goals reached.`);
    return false;
  }
  return true;
}

// function to set up game
// this is the main function that creates the game and calls the other functions
async function gameSetup(url) {
  try {
    document.querySelector('.goal').classList.add('hide');
    airportMarkers.clearLayers();
    const gameData = await getData(url);
    console.log(gameData);
    updateStatus(gameData);
    if (!checkGameOver(gameData)) return;
    await minigame(gameData.location[0]);
    for (let airport of gameData.location) {
      const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
      airportMarkers.addLayer(marker);
      if (airport.active) {
        map.flyTo([airport.latitude, airport.longitude], 5);
        showWeather(airport);
        /*checkGoals(airport.weather.meets_goals);*/
        marker.bindPopup(`You are here: <b>${airport.name}</b>`);
        marker.openPopup();
        marker.setIcon(greenIcon);
      } else {
        marker.setIcon(blueIcon);
        const popupContent = document.createElement('div');
        const h4 = document.createElement('h4');
        h4.innerText = airport.name;
        popupContent.append(h4);
        const goButton = document.createElement('button');
        goButton.classList.add('button');
        goButton.innerText = 'Fly here';
        popupContent.append(goButton);
        const p = document.createElement('p');
        p.innerText = `Distance ${airport.distance}km`;
        popupContent.append(p);

        // Weather icon and description on destinations (Max)

        async function weather(){
          this.removeEventListener('click', weather);
          popupContent.append(await showWeatherOnIcon(airport));
        }

        marker.addEventListener('click', weather);

        //

        marker.bindPopup(popupContent);

        goButton.addEventListener('click', function () {
          gameSetup(`${apiUrl}flyto?game=${gameData.status.id}&dest=${airport.ident}&consumption=${airport.co2_consumption}`);
        });
      }
    }
    updateGoals(gameData.goals);
  } catch (error) {
    console.log(error);
  }
}

// Open modal to show guide when clicked
const guide = document.querySelector('#guide');

const dialog = document.querySelector('dialog');

const span = dialog.querySelector('span');

guide.addEventListener('click', openModal);

function openModal() {
  dialog.showModal();
}

window.onclick = function(event) {
  if (event.target === guide) {
    openModal();
  }
  if (event.target === dialog || event.target === span) {
    hideModal();
  }
};

function hideModal() {
  dialog.close();
}

// event listener to hide goal splash
document.querySelector('.goal').addEventListener('click', function (evt) {
  evt.currentTarget.classList.add('hide');
});

window.addEventListener("DOMContentLoaded", event => {
  const audio = document.querySelector("audio");
  audio.volume = 0.1;
  audio.play();
});