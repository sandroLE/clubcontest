using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using SampleMvcApp.DataModels;

namespace SampleMvcApp.Extensions
{
	public static class FlightExtension
	{
		const string timePattern = @"(?<HH>[0-9][0-9])(?<MM>[0-9][0-9])(?<SS>[0-9][0-9])";
		const string latPattern = @"(?<LatDeg>[0-9][0-9])(?<LatMin>[0-9][0-9][0-9][0-9][0-9])[N|S]";
		const string lonPattern = @"(?<LonDeg>[0-1][0-9][0-9])(?<LonMin>[0-9][0-9][0-9][0-9][0-9])[E|W]";
		const string altPattern = @"(?<alt>[0-9][0-9][0-9][0-9][0-9])";
		const string gpsAltPattern = @"(?<gpsAlt>[0-9][0-9][0-9][0-9][0-9])";

		public static Point[] CreatePoints(this Flight flight)
		{
			var igcFileText = flight.IgcFile;
			var points = new List<Point>();

			foreach (var line in igcFileText.Split(new[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries))
			{
				var regex = new System.Text.RegularExpressions.Regex($"B{timePattern}{latPattern}{lonPattern}A{altPattern}{gpsAltPattern}");

				if (regex.IsMatch(line))
				{
					var match = regex.Match(line);
					var groups = match.Groups;

					var hours = int.Parse(groups["HH"].Value);
					var minutes = int.Parse(groups["MM"].Value);
					var seconds = int.Parse(groups["SS"].Value);

					var latDeg = double.Parse(groups["LatDeg"].Value);
					var latMin = double.Parse(groups["LatMin"].Value) / 1000;
				

					var lonDeg = double.Parse(groups["LonDeg"].Value);
					var lonMin = double.Parse(groups["LonMin"].Value) / 1000;
			

					var alt = int.Parse(groups["alt"].Value);
					var gpsAlt = int.Parse(groups["gpsAlt"].Value);

					var lat = latDeg + latMin/60;
					var lon = lonDeg + lonMin/60;

					points.Add(new Point(lat, lon, new DateTime(2016,1,1, hours, minutes, seconds)));
				}
			}

			return points.ToArray();
		}
	}

	public class Point
	{
		public Point(double lat, double lon, DateTime time)
		{
			Latitude = lat;
			Longitude = lon;
			Time = time;
		}
		public double Latitude { get; set; }
		public double Longitude { get; set; }

		public DateTime Time { get; set; }

	}
}
