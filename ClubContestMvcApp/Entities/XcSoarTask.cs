using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SampleMvcApp.DataModels;


namespace SampleMvcApp.Entities
{
	public class XcSoarTask
	{
		public IList<TaskPoint> TaskPoints { get; set; }

		public string Type { get; set; }
		public int? AatMinTime { get; set; }

		public string ToXml()
		{
			var xml = new XDocument();

			var taskNode = new XElement("Task");
			taskNode.Add(new XAttribute("type", Type));
			taskNode.Add(new XAttribute("aat_min_time", AatMinTime));
			foreach (var taskPoint in TaskPoints)
			{
				var point = new XElement("Point");
				point.Add(new XAttribute("type", taskPoint.Type));
					var waypoint = new XElement("Waypoint");
					waypoint.Add(new XAttribute("name", taskPoint.Name));
					waypoint.Add(new XAttribute("id", 0));
					waypoint.Add(new XAttribute("comment", ""));
					waypoint.Add(new XAttribute("altitude", "-999.0"));
					point.Add(waypoint);

						var location = new XElement("Location");
						location.Add(new XAttribute("longitude", taskPoint.Longitude));
						location.Add(new XAttribute("latitude", taskPoint.Latitude));
						waypoint.Add(location);

				var observationZone = new XElement("ObservationZone");
				observationZone.Add(new XAttribute("type", taskPoint.ObservationZone.Type));
				if (taskPoint.ObservationZone.Type == "Cylinder")
					observationZone.Add(new XAttribute("radius", taskPoint.ObservationZone.Radius));
				if (taskPoint.ObservationZone.Type == "Line")
					observationZone.Add(new XAttribute("length", taskPoint.ObservationZone.Length));

				point.Add(observationZone);
				taskNode.Add(point);
			}
			xml.Add(taskNode);

			return xml.ToString();
		}

		public static XcSoarTask Parse(string taskString)
		{
			if (taskString == null)
			{
				return null;
			}

			try
			{
				var xml = XDocument.Parse(taskString);
				var tasks = from t in xml.Elements("Task")
										let points = from p in t.Elements("Point")
																 let waypoint = p.Element("Waypoint")
																 let location = waypoint.Element("Location")
																 let observationZone = p.Element("ObservationZone")

																 select new TaskPoint
																 {
																	 Type = (string)p.Attribute("type"),
																	 Name = (string)waypoint.Attribute("name"),
																	 Latitude = (double)location.Attribute("latitude"),
																	 Longitude = (double)location.Attribute("longitude"),
																	 ObservationZone = new ObservationZone
																	 {
																		 Type = (string)observationZone.Attribute("type"),
																		 Length = (int?)(double?)observationZone.Attribute("length"),
																		 Radius = (int?)(double?)observationZone.Attribute("radius")
																	 }
																 }

										select new XcSoarTask
										{
											Type = (string)t.Attribute("type"),
											AatMinTime = (int?)t.Attribute("aat_min_time"),
											TaskPoints = points.ToList()
										};


				return tasks.FirstOrDefault();
			}
			catch (Exception)
			{
				return null;
			}

		}
	}

}

/*
 <Task type="AAT" task_scored="0" aat_min_time="10800" start_max_speed="60" start_max_height="0" start_max_height_ref="MSL" finish_min_height="0" finish_min_height_ref="AGL" fai_finish="0" min_points="2" max_points="13" homogeneous_tps="0" is_closed="0">
  <Point type="Start">
    <Waypoint name="02Strehla" id="0" comment="" altitude="-999.0">
      <Location longitude="13.226383333333333" latitude="51.35221666666666"/>
    </Waypoint>
    <ObservationZone type="Line" length="20000.0"/>
  </Point>
  <Point type="Area">
    <Waypoint name="444Wittenberg" id="0" comment="" altitude="-999.0">
      <Location longitude="12.646666666666667" latitude="51.857216666666666"/>
    </Waypoint>
    <ObservationZone type="Cylinder" radius="25000.0"/>
  </Point>
  <Point type="Area">
    <Waypoint name="054Bronkow" id="0" comment="EDBQ 130.325" altitude="128.0">
      <Location longitude="13.91195" latitude="51.66361666666667"/>
    </Waypoint>
    <ObservationZone type="Cylinder" radius="25000.0"/>
  </Point>
  <Point type="Finish">
    <Waypoint name="010CANIZ" id="0" comment="" altitude="-999.0">
      <Location longitude="13.227783333333333" latitude="51.30305"/>
    </Waypoint>
    <ObservationZone type="Line" length="10000.0"/>
  </Point>
</Task>

	 
	 
	 */
