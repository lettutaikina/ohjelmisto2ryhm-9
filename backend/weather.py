import requests
import os

from dotenv import load_dotenv
load_dotenv()

class Weather:

    def __init__(self, sijainti, game):
        apikey = os.environ.get('API_KEY')

        request = "https://api.openweathermap.org/data/2.5/weather?lat=" + \
                 str(sijainti.latitude) + "&lon=" + str(sijainti.longitude) + "&appid=" + apikey + "&units=metric"
        vastaus = requests.get(request).json()
        self.main = vastaus["weather"][0]["main"]
        self.description = vastaus["weather"][0]["description"]
        self.icon = "https://openweathermap.org/img/wn/" + vastaus["weather"][0]["icon"] + ".png"
        self.temp = vastaus["main"]["temp"]
        self.humidity = vastaus["main"]["humidity"]
        self.wind = {
            "speed": vastaus["wind"]["speed"],
            "deg": vastaus["wind"]["deg"]
        }
