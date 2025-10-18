from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import math

class TripView(APIView):
    def post(self, request):
        data = request.data
        try:
            # Parse coordinates
            current = list(map(float, data.get("current","0,0").split(",")))
            pickup = list(map(float, data.get("pickup","0,0").split(",")))
            dropoff = list(map(float, data.get("dropoff","0,0").split(",")))
            current_cycle_used_hours = float(data.get("current_cycle_used_hours", 0))

            # Approximate distance (Haversine)
            from math import radians, cos, sin, asin, sqrt
            def haversine(lat1, lon1, lat2, lon2):
                lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
                dlon = lon2 - lon1
                dlat = lat2 - lat1
                a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
                c = 2 * asin(sqrt(a))
                r = 3956  # miles
                return c * r

            distance_miles = haversine(current[0], current[1], dropoff[0], dropoff[1])

            # Estimate hours with average speed ~55 mph
            estimated_drive_hours = distance_miles / 55

            # Fuel and rest stops
            fuel_stops = max(0, math.floor(distance_miles / 1000))
            rest_stops = max(0, math.floor(estimated_drive_hours / 8))

            # Remaining cycle
            cycle_remaining_hours = max(0, 70 - current_cycle_used_hours - estimated_drive_hours)

            # Generate daily log (8h max per day)
            days_plan = []
            remaining_hours = estimated_drive_hours
            day = 1
            while remaining_hours > 0:
                day_hours = min(8, remaining_hours)
                days_plan.append({"day": day, "hours": round(day_hours,2)})
                remaining_hours -= day_hours
                day += 1

            # Generate route geometry with interpolation for smooth line
            def interpolate_points(start, end, steps=50):
                lat1, lon1 = start
                lat2, lon2 = end
                points = []
                for i in range(steps + 1):
                    lat = lat1 + (lat2 - lat1) * i / steps
                    lon = lon1 + (lon2 - lon1) * i / steps
                    points.append([lat, lon])
                return points

            route_coords = []
            route_coords += interpolate_points(current, pickup, steps=10)
            route_coords += interpolate_points(pickup, dropoff, steps=50)

            osrm_geometry = {
                "coordinates": route_coords
            }

            summary = {
                "distance_miles": round(distance_miles, 2),
                "estimated_drive_hours": round(estimated_drive_hours, 2),
                "fuel_stops_estimated": fuel_stops,
                "rest_stops_estimated": rest_stops,
                "cycle_remaining_hours": round(cycle_remaining_hours, 2)
            }

            return Response({
                "summary": summary,
                "osrm_geometry": osrm_geometry,
                "days_plan": days_plan
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
