import random
import config
from airport import Airport


class MiniGames:

    def __init__(self, airport):
        self.game_reward = False
        self.game = False
        self.size = False
        self.distance = False
        self.no_reward = config.no_reward

        self.airport1 = self.minigame_airport(self.get_random_type())
        self.airport2 = self.minigame_airport(self.get_random_type())

        if airport.type == "medium_airport":
            if random.randint(1, 100) <= config.medium_percentage:
                self.choose_game(airport)

        elif airport.type == "large_airport":
            if random.randint(1, 100) <= config.large_percentage:
                self.choose_game(airport)

    # get random type for airports
    def get_random_type(self):
        number = random.randint(1, 3)

        if number == 1:
            type_search = "small_airport"
        elif number == 2:
            type_search = "medium_airport"
        else:
            type_search = "large_airport"

        return type_search

    # get airport for minigames
    def minigame_airport(self, type):
        sql = f"SELECT ident FROM airport" \
              f" WHERE type in ('{type}')"
        sql += f" ORDER BY RAND() LIMIT 1;"
        # print(sql)
        cursor = config.conn.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()
        if len(result) > 0:
            return Airport(result[0][0])

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
