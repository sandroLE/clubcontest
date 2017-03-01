using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SampleMvcApp.DataModels
{
    public class User
    {
		public int Id { get; set; }
		public string Auth0Id { get; set; }

		public string Name { get; set; }

		[JsonIgnore]
		public virtual ICollection<Competition> Competitions { get; set; }
		[JsonIgnore]
		public virtual ICollection<Flight> Flights { get; set; }
	}
}
