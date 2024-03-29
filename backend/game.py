import string, random
from airport import Airport
import config

class Game:

    def __init__(self, id, loc, consumption, player=None):
        self.status = {}
        self.location = []
        self.visited = 0
        self.end = config.goal
        self.goal = False

        if id == 0:
            letters = string.ascii_lowercase + string.ascii_uppercase + string.digits
            #strong id for new players
            self.status = {
                "id" : "".join(random.choice(letters) for i in range(6)),
                "name" : player,
                "co2" : {
                    "consumed" : config.co2_initial,
                    "budget" : config.co2_budget
                }
            }

            #lisätään uusi peli tietokantaan
            print(player)
            self.location.append(Airport(loc, True))
            sql = "INSERT INTO Game VALUES ('" + self.status["id"] + "', " + str(self.status["co2"]["consumed"])
            sql += ", " + str(self.status["co2"]["budget"]) + ", '" + str(loc) + "', '" + str(self.status["name"]) + "')"
            print(sql)
            cur = config.conn.cursor()
            cur.execute(sql)

        else:
            #update consumption and budget
            sql2 = f"UPDATE Game SET co2_consumed = co2_consumed + {str(consumption)}, co2_budget = co2_budget - {str(consumption)} WHERE id='" + str(id) + "'"
            print(sql2)
            cur2 = config.conn.cursor()
            cur2.execute(sql2)
            # find game from DB
            sql = "SELECT id, co2_consumed, co2_budget, location, screen_name FROM Game WHERE id='" + str(id) + "'"
            print(sql)
            cur = config.conn.cursor()
            cur.execute(sql)
            res = cur.fetchall()
            if len(res) == 1:
                # game found
                self.status = {
                    "id": res[0][0],
                    "name": res[0][4],
                    "co2": {
                        "consumed": res[0][1],
                        "budget": res[0][2]
                    }
                }

                if loc == "":
                    apt = Airport(res[0][3], True)
                    self.location.append(apt)
                    self.set_location(apt)
                else:
                    # old location in DB currently not used
                    apt = Airport(loc, True)
                    self.location.append(apt)
                    self.set_location(apt)

            else:
                print("************** PELIÄ EI LÖYDY! ***************")

    def set_location(self, sijainti):
        #self.location = sijainti
        sql = "UPDATE Game SET location='" + sijainti.ident + "' WHERE id='" + self.status["id"] + "'"
        print(sql)
        cur = config.conn.cursor()
        cur.execute(sql)
        #sql2 = "INSERT INTO goal_reached(iso_country) VALUES ('" + sijainti.iso_country + "')"
        sql2 = "INSERT INTO goal_reached VALUES ('" + self.status["id"] + "', '" + sijainti.iso_country + "')"
        print(sql2)
        cur2 = config.conn.cursor()
        cur2.execute(sql2)

        sql3 = "SELECT Count(DISTINCT iso_country) FROM goal_reached WHERE game_id='" + self.status["id"] + "'"
        print(sql3)
        cur3 = config.conn.cursor()
        cur3.execute(sql3)
        res = cur3.fetchall()
        if len(res) == 1:
            print(res[0][0])
            self.visited = res[0][0]
            if res[0][0] >= config.goal:
                self.goal = True

        #config.conn.commit()
        #self.loc = sijainti.ident