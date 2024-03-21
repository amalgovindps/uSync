using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Dashboards;

namespace ImportSyncData.DashC
{
	public class PublisherDash : IDashboard
	{
		public string[] Sections => new[] { Constants.Applications.Content };

		public IAccessRule[] AccessRules

		{
			get

			{
				var rules = new IAccessRule[]

				{

				new AccessRule {Type = AccessRuleType.Grant, Value = Constants.Security.EditorGroupAlias}

				};

				return rules;
			}
		}

		public string Alias => "HelloWorld";
		public string View => "/umbraco/backoffice/Plugins/Admin/HelloWorld";
	}
}
