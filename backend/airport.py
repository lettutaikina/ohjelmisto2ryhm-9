import random
import config
from weather import Weather
from geopy import distance


class Airport:
    # lisätty data, jottei tartte jokaista lentokenttää hakea erikseen
    def __init__(self, ident, active=False, data=None):
        self.ident = ident
        self.active = active

        # vältetään kauhiaa määrää hakuja
        if data is None:
            # find airport from DB
            sql = "SELECT ident, name, latitude_deg, longitude_deg, iso_country, type FROM Airport WHERE ident='" + ident + "'"
            print(sql)
            cur = config.conn.cursor()
            cur.execute(sql)
            res = cur.fetchall()
            if len(res) == 1:
                # game found
                self.ident = res[0][0]
                self.name = res[0][1]
                self.latitude = float(res[0][2])
                self.longitude = float(res[0][3])
                self.iso_country = res[0][4]
                self.type = res[0][5]
        else:
            self.name = data['name']
            self.latitude = float(data['latitude'])
            self.longitude = float(data['longitude'])
            self.type = data['type']

    def find_nearby_airports(self):
        lista = []
        # haetaan kaikki tiedot kerralla
        sql = "SELECT ident, name, latitude_deg, longitude_deg, type FROM Airport WHERE latitude_deg BETWEEN "
        sql += str(self.latitude - config.max_lat_dist) + " AND " + str(self.latitude + config.max_lat_dist)
        sql += " AND longitude_deg BETWEEN "
        sql += str(self.longitude - config.max_lon_dist) + " AND " + str(self.longitude + config.max_lon_dist)
        sql += "and type in ('medium_airport', 'large_airport')"
        print(sql)
        cur = config.conn.cursor()
        cur.execute(sql)
        res = cur.fetchall()
        for r in res:
            if r[0] != self.ident:
                # lisätty data, jottei jokaista kenttää tartte hakea
                # uudestaan konstruktorissa
                data = {'name': r[1], 'latitude': r[2], 'longitude': r[3], 'type': r[4]}
                print(data)
                nearby_apt = Airport(r[0], False, data)
                nearby_apt.distance = self.distanceTo(nearby_apt)
                if nearby_apt.distance <= config.max_distance:
                    lista.append(nearby_apt)
                    nearby_apt.co2_consumption = self.co2_consumption(nearby_apt.distance)
        return lista

    def fetchWeather(self, game):
        self.weather = Weather(self, game)
        return

    def distanceTo(self, target):

        coords_1 = (self.latitude, self.longitude)
        coords_2 = (target.latitude, target.longitude)
        dist = distance.distance(coords_1, coords_2).km
        return int(dist)

    def co2_consumption(self, km):
        # consumption = config.co2_per_flight + km * config.co2_per_km
        print(f'Sääääääääääää on oikeesti   {self.weather.main}')

        crappyweather = ['Fog', 'Snow', 'Rain', 'Drizzle', 'Thunderstorm']
        gameoverweather = ['Tornado', 'Ash']

        for i in crappyweather:
            if self.weather.main == i:
                print('1 iffi')
                print(self.weather.main)
                print(i)
                consumption = config.co2_per_rain + (km*2) * config.co2_per_km
                return consumption

        for i in gameoverweather:
            if self.weather.main == i:
                print('2 iffi')
                print(self.weather.main)
                print(i)
                consumption = config.co2_per_rain + (km*2) * config.co2_per_km*100000
                return consumption

        consumption = config.co2_per_flight + km * config.co2_per_km
        return consumption
