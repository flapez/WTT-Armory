using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Dialog;
using SPTarkov.Server.Core.Models.Eft.Profile;

namespace WTTArmory.Chatbot
{
    public interface IWTTCommand
    {
        public string Command { get; }
        public string CommandHelp { get; }
        public ValueTask<string> PerformAction(UserDialogInfo commandHandler, MongoId sessionId, SendMessageRequest request);
    }
}