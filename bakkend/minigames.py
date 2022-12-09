import random
import config
from airport import Airport


class MiniGames:

    def __init__(self, airport):
        self.game_reward = False
        self.game = False
        self.size = False
        self.distance = False

        sql = f"SELECT ident FROM airport" \
              f" WHERE type in ('small_airport', 'medium_airport', 'large_airport')"
        sql += f" ORDER BY RAND() LIMIT 2;"
        # print(sql)
        cursor = config.conn.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()
        print(airport.type)
        if len(result) > 0:
            self.airport1 = Airport(result[0][0])
            self.airport2 = Airport(result[1][0])

        if airport.type == "medium_airport":
            if random.randint(1, 100) <= config.medium_percentage:
                self.choose_game(airport)

        elif airport.type == "large_airport":
            if random.randint(1, 100) <= config.large_percentage:
                self.choose_game(airport)

    # chooses minigame
    def choose_game(self, airport):
        if random.randint(1, 100) <= config.first_minigame_percentage:
            self.game = 1
            self.guess_size(self.airport1)
        else:
            self.game = 2
            self.guess_distance(airport, self.airport1, self.airport2)

    # minigame 1
    def guess_size(self, airport1):
        self.game = 1
        self.game_reward = config.first_game_reward
        self.size = airport1.type

    # minigame 2
    def guess_distance(self, airport, airport1, airport2):
        self.game = 2
        self.game_reward = config.second_game_reward
        if airport.distanceTo(airport1) < airport.distanceTo(airport2):
            self.distance = 1
        else:
            self.distance = 2
