# Game parameters
#max distance where you can fly / draw airports
max_distance = 1000
max_lat_dist = max_distance/50
max_lon_dist = max_distance/50

#budget etc. for fuel
co2_initial = 0
co2_budget = 10000
co2_per_flight = 50
#co2_if_rain = 150
co2_per_km = 1

#ei käytetä oikeesti , tulee javascriptist
default_starting_point = "EFRO"
default_name = "DDK"

# Internal shared variables -- do not modify
conn = None

