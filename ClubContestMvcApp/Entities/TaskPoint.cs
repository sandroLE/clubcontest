using SampleMvcApp.DataModels;

namespace SampleMvcApp.Entities
{
	public class TaskPoint
	{
		public int Index { get; set; }

		public string Name { get; set; }

		public double Longitude { get; set; }
		public double Latitude { get; set; }

		public string ObservationZoneType { get; set; }

		public ObservationZone ObservationZone { get; set; }

		public string Type { get; set; }
	}
}