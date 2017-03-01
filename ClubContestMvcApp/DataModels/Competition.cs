using System.Collections.Generic;
using Newtonsoft.Json;

namespace SampleMvcApp.DataModels
{
	public class Competition
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public int CreatorId { get; set; }

		public  User Creator { get; set; }

		public string AdminUsers { get; set; }
	
		[JsonProperty("Days")]
		public  IList<Day> Days { get; set; }



	}
}