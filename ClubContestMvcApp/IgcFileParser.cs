using System;
using System.Collections.Generic;
using System.Linq;

namespace ClubContestMvcApp
{
	public class IgcFileParser
	{
		public string CompetitionId { get; private set; }
		public string GliderType { get; private set; }


		public void Parse(string file)
		{
			var lines = file.Split(new[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries).Reverse();

			foreach (var line in lines)
			{
				readCompetitionId(line);
				readGliderType(line);
			}

			GliderType = GliderType?.Replace("_", " ");
		}


		private void readGliderType(string line)
		{
			if (line.ToUpper().Contains("HFCIDCOMPETITIONID:"))
			{
				var cid = line.Split(':').Last();
				if (!string.IsNullOrEmpty(cid))
				{
					GliderType = cid;
				}
			}
			if (GliderType == null && line.ToUpper().Contains("LCU::HPGTYGLIDERTYPE:"))
			{
				var cid = line.Split(':').Last();
				if (!string.IsNullOrEmpty(cid))
				{
					GliderType = cid;
				}
			}
		}

		private void readCompetitionId(string line)
		{
			if (line.ToUpper().Contains("LCU::HPCIDCOMPETITIONID:"))
			{
				var cid = line.Split(':').Last();
				if (!string.IsNullOrEmpty(cid))
				{
					CompetitionId = cid;
				}
			}
			if (CompetitionId == null && line.ToUpper().Contains("HFCIDCOMPETITIONID:"))
			{
				var cid = line.Split(':').Last();
				if (!string.IsNullOrEmpty(cid))
				{
					CompetitionId = cid;
				}
			}
		}
	}
}
