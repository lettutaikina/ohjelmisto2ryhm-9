import json
import os

import mysql.connector
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS

import config
from game import Game
from airport import Airport
from minigames import MiniGames

load_dotenv()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# DB Connection
config.conn = mysql.connector.connect(
         host=os.environ.get('HOST'),
         port= 3306,
         database=os.environ.get('DB_NAME'),
         user=os.environ.get('DB_USER'),
         password=os.environ.get('DB_PASS'),
         autocommit=True
         )

def fly(id, dest, consumption=0, player=None, focus=None):
    if id==0:
        game = Game(0, dest, consumption, player)
    else:
        game = Game(id, dest, consumption)
    game.location[0].fetchWeather(game)
    nearby = game.location[0].find_nearby_airports()
    for a in nearby:
        game.location.append(a)
    json_data = json.dumps(game, default=lambda o: o.__dict__, indent=4)
    return json_data


# http://127.0.0.1:5000/flyto?game=<gameid>&dest=EFHK&consumption=100
@app.route('/flyto')
def flyto():
    args = request.args
    id = args.get("game")
    dest = args.get("dest")
    consumption = args.get("consumption")
    json_data = fly(id, dest, consumption)
    print("*** Called flyto endpoint ***")
    return json_data


# http://127.0.0.1:5000/newgame?player=JK&loc=EFHK
@app.route('/newgame')
def newgame():
    args = request.args
    player = args.get("player")
    dest = args.get("loc")
    json_data = fly(0, dest, 0, player)
    return json_data

# Added new app.route for fetching weather data for desired destinations (Max)

# http://127.0.0.1:5000/icondata?icon=<ident>
@app.route('/icondata')
def icondata():
    args = request.args
    icon = args.get("icon")
    airport = Airport(icon)
    airport.fetchWeather(airport)
    print("*** Called icon endpoint ***")
    json_data = json.dumps(airport, default=lambda o: o.__dict__, indent=4)
    # print(json_data)
    return json_data

# Fetches minigame (Max)

# http://127.0.0.1:5000/minigame?loc=<ident>
@app.route('/minigame')
def minigame():
    args = request.args
    ident = args.get("loc")
    airport = Airport(ident)
    print(airport.type)
    minigame = MiniGames(airport)
    print("*** Called minigame endpoint ***")
    json_data = json.dumps(minigame, default=lambda o: o.__dict__, indent=4)
    print(json_data)
    return json_data



if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=5000)
