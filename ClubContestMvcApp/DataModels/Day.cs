using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using SampleMvcApp.Entities;

namespace SampleMvcApp.DataModels
{
	public class Day
	{
		public int Id { get; set; }
		public DateTime Date { get; set; }

		public int CompetitionId { get; set; }

		[JsonIgnore]
		public string Task { get; set; }

		public string TaskFileFormat { get; set; }


		public XcSoarTask XcSoarTask { get; set; }

		public virtual Competition Competition { get; set; }

		
		public IList<Flight> Flights { get; set; }
	}
}
