'use strict';
/* 1. show map using Leaflet library. (L comes from the Leaflet library) */

const map = L.map('map', {tap: false});
L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: 'Stamen',
    minZoom: 4,
    maxZoom: 7,
}).addTo(map);
map.setView([60, 24], 5);

// global variables
const apiUrl = 'http://127.0.0.1:5000/';
const startLoc = 'EFHK';
const globalGoals = [];
const airportMarkers = L.featureGroup().addTo(map);
let reward = 0;

// icons
const blueIcon = L.divIcon({className: 'blue-icon'});
const greenIcon = L.divIcon({className: 'green-icon'});
const redIcon = L.divIcon({className: 'red-icon'});
const largeIcon = L.icon({
    iconUrl: 'https://cdn.discordapp.com/attachments/1021369659515228260/1051585974079074426/Large_airport.png',
    iconSize: [30, 30]
});
const mediumIcon = L.icon({
    iconUrl: 'https://cdn.discordapp.com/attachments/1021369659515228260/1051592028959551588/Medium_airport.png',
    iconSize: [27, 27]
});
const startIcon = L.icon({
   iconUrl: 'https://cdn.discordapp.com/attachments/1021369659515228260/1051834493645897769/Start.location.png',
   iconSize: [30, 30]
});

// form for player name
document.querySelector('#player-form').addEventListener('submit', function (evt) {
    evt.preventDefault();
    const playerName = document.querySelector('#player-input').value;
    const id = document.querySelector('#id-input').value ? document.querySelector('#id-input').value : 0;
    document.querySelector('#player-modal').classList.add('hide');
    console.log(id)
    console.log(typeof id)
    gameSetup(`${apiUrl}newgame?player=${playerName}&loc=${startLoc}&id=${id}`);
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
    document.querySelector('#player-name').innerHTML = `Player: ${status.status.name},  Id: ${status.status.id}`;
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

async function getDestinationConsumption(destination, location) {

    const consumptionData = await getData(`${apiUrl}co2consumption?dest=${destination.ident}&loc=${location.ident}`)
    console.log(consumptionData);
    return consumptionData;
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
    reward = minigameData.no_reward;


    // minigame 1 function
    if (minigameData.game === 1) {
        console.log("hello")
        const dialog = document.getElementById("minigame1");
        const h3 = document.querySelector("#minigame1 h3");
        const p = document.querySelector("#minigame1 p");
        const buttons = [];

        window.onkeydown = function (e) {
            if (e.keyCode === 27) { // Key code for ESC key
                e.preventDefault();
            }
        };
        //prevent esc from closing minigames

        buttons.push(document.getElementById("small"), document.getElementById("medium"), document.getElementById("large"));
        h3.innerHTML = minigameData.airport1.name;

        small.disabled = false;
        medium.disabled = false;
        large.disabled = false;

        // enables all 3 buttons

        for (let button of buttons) {
            button.addEventListener('click', function () {

                small.disabled = true;
                medium.disabled = true;
                large.disabled = true;

                // disables all 3 buttons after one has been pressed

                if (button.value === minigameData.size) {
                    reward = minigameData.game_reward;
                    p.innerHTML = `Correct! Budget: +${reward}`;
                } else {
                    p.innerHTML = "Incorrect!";
                }
                setTimeout(closeDialog, 3000, dialog, p);
            });
        }
        // showModal enables "esc" button to quit modal (Modal)
        dialog.showModal();
    }


    // minigame 2 function
    if (minigameData.game === 2) {
        console.log("hello2")
        const dialog = document.getElementById("minigame2");
        //const h3_a1 = document.getElementById("airport1");
        //const h3_a2 = document.getElementById("airport2");
        const p = document.querySelector("#minigame2 p");
        const buttons = [];
        const button1 = document.getElementById("1");
        const button2 = document.getElementById("2");
        button1.innerText = minigameData.airport1.name;
        button2.innerText = minigameData.airport2.name;

        button1.disabled = false;
        button2.disabled = false;

        // enables the buttons when minigame starts

        window.onkeydown = function (e) {
            if (e.keyCode === 27) { // Key code for ESC key
                e.preventDefault();
            }
        };

        //prevent esc from closing minigame

        buttons.push(button1, button2);
        //h3_a1.innerText = minigameData.airport1.name;
        //h3_a2.innerText = minigameData.airport2.name;
        for (let button of buttons) {
            button.addEventListener('click', function () {

                button1.disabled = true;
                button2.disabled = true;

                // disables both buttons after either one has been pressed

                if (parseInt(button.value) === minigameData.distance) {
                    reward = minigameData.game_reward;
                    p.innerHTML = `Correct! Budget: +${reward}`;
                } else {
                    p.innerHTML = "Incorrect!";
                }
                setTimeout(closeDialog, 3000, dialog, p);
            });
        }
        dialog.showModal();
    }

    function closeDialog(dialog, p) {
        console.log(reward);
        dialog.close();
        p.innerHTML = "";
    }
}

// function to check if game is over
function checkGameOver(gamedata) {
    if (gamedata.goal) {
        const dialog=document.getElementById('won');
        dialog.showModal();
        return false;
    }
    if (gamedata.status.co2.budget <= 0) {
        const dialog=document.getElementById('lost');
        dialog.showModal();
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
        if (gameData.location[0].ident !== startLoc) await minigame(gameData.location[0]);
        for (let airport of gameData.location) {
            const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
            airportMarkers.addLayer(marker);
            if (airport.active) {
                map.flyTo([airport.latitude, airport.longitude], 5);
                showWeather(airport);
                /*checkGoals(airport.weather.meets_goals);*/
                marker.bindPopup(`You are here: <b>${airport.name}</b>`);
                marker.openPopup();
                marker.setIcon(redIcon);
            } else {
                if (airport.type === 'medium_airport'){
                    marker.setIcon(mediumIcon);
                } else if (airport.ident === startLoc){
                   marker.setIcon(startIcon) ;
                } else {
                    marker.setIcon(largeIcon);
                }
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

                async function weather() {
                    this.removeEventListener('click', weather);
                    popupContent.append(await showWeatherOnIcon(airport));
                    airport.co2_consumption = await getDestinationConsumption(airport, gameData.location[0]);
                }

                marker.addEventListener('click', weather);

                //

                marker.bindPopup(popupContent);

                goButton.addEventListener('click', function () {
                    console.log("minigame " + reward);
                    gameSetup(`${apiUrl}flyto?game=${gameData.status.id}&dest=${airport.ident}&consumption=${airport.co2_consumption - reward}`);
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
const story = document.querySelector('#story');

const guideDialog = document.getElementById('guideDialog');
const storyDialog = document.getElementById('storyDialog');

const guideSpan = guideDialog.querySelector('span');
const storySpan = storyDialog.querySelector('span');

//guide.addEventListener('click', openModal);
//story.addEventListener('click', openModal);

function openModal(dialog) {
    dialog.showModal();
}

window.onclick = function (event) {
    if (event.target === story) {
        openModal(storyDialog);
    }
    if (event.target === guide) {
        openModal(guideDialog);
    }
    if (event.target === guideDialog || event.target === guideSpan) {
        hideModal(guideDialog);
    }
    if (event.target === storyDialog || event.target === storySpan) {
        hideModal(storyDialog);
    }
};

function hideModal(dialog) {
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
