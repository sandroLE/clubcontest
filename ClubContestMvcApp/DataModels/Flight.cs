using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using SampleMvcApp.Extensions;

namespace SampleMvcApp.DataModels
{
    public class Flight
    {
		public int Id { get; set; }
		public int DayId { get; set; }

		[JsonIgnore]
		public string IgcFile { get; set; }

		public int UserId { get; set; }
		
		public User User { get; set; }

		public Day Day { get; set; }

	  public Point[] Points { get; set; }

		public double? Speed { get; set; }

		public double? Distance { get; set; }

		public double? Duration { get; set; }

		public bool? Finished { get; set; }

		public string TurnPoints { get; set; }
		
		public string GliderType { get; set; }

		public double Handicap { get; set; }

	  public string PilotName {get;set;}
	}
}
