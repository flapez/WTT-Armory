using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Helpers;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Dialog;
using SPTarkov.Server.Core.Models.Enums;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Servers;
using SPTarkov.Server.Core.Services.Mod;
using SPTarkov.Server.Core.Utils;
using WTTArmory.Chatbot;
using WTTArmory.Chatbot.Commands;
using WTTArmory.Models;

namespace WTTArmory.Routes;

[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 2)]
public class WTTBotWelcomeGiftStaticRouter : StaticRouter
{
    private readonly ProfileHelper _profileHelper;
    private readonly WTTBot _wttBot;
    private readonly ISptLogger<WTTBotWelcomeGiftStaticRouter> _logger;
    private readonly SaveServer _saveServer;
    private readonly IServiceProvider _serviceProvider;
    private readonly ProfileDataService _profileDataService;

    public WTTBotWelcomeGiftStaticRouter(
        JsonUtil jsonUtil,
        ProfileHelper profileHelper,
        WTTBot wttBot,
        SaveServer saveServer,
        IServiceProvider serviceProvider,
        ISptLogger<WTTBotWelcomeGiftStaticRouter> logger,
        ProfileDataService profileDataService
        ) 
        : base(jsonUtil, GetRoutes())
    {
        _saveServer = saveServer;
        _profileHelper = profileHelper;
        _wttBot = wttBot;
        _serviceProvider = serviceProvider;
        _logger = logger;
        _profileDataService = profileDataService;
    }
    private const string ModKey = "WTT-Armory";

    private static IEnumerable<RouteAction> GetRoutes()
    {
       return new[]
        {
            new RouteAction(
                "/client/friend/list",
                async (url, info, sessionId, output) =>
                {
                    return output;
                })
        };
    }

    public override async ValueTask<object> HandleStatic(
        string url,
        string? body,
        MongoId sessionId,
        string output)
    {
        var result = await base.HandleStatic(url, body, sessionId, output);

        if (url == "/client/friend/list")
        {
            await HandleFriendList(sessionId.ToString());
        }

        return result;
    }
    private async Task HandleFriendList(string sessionId)
    {
        try
        {
            var profileId = sessionId.ToString();

            var giftData = _profileDataService.GetProfileData<WTTWelcomeGiftData>(profileId, ModKey);
            if (giftData == null)
            {
                var dummyRequest = new SendMessageRequest
                {
                    DialogId = new MongoId(),
                    Text = "wtt welcomegift",
                    Type = MessageType.UserMessage,
                    ReplyTo = null
                };

                var welcomeGiftCommand = _serviceProvider.GetService<WelcomeGiftCommand>();
                if (welcomeGiftCommand != null)
                {
                    await welcomeGiftCommand.PerformAction(
                        _wttBot.GetChatBot(),
                        sessionId,
                        dummyRequest
                    );
                }
                else
                {
                    _logger.Error("WelcomeGiftCommand not available from service provider.");
                }

                _logger.Info("Sent WTT welcome gift to player via command");
            }
        }
        catch (Exception ex)
        {
            _logger.Error($"Error sending WTT welcome gift: {ex.Message}");
        }
    }

    
}