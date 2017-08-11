/*-----------------------------------------------------------------------------
To learn more about this template please visit
https://aka.ms/abs-node-proactive
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));


/*

// Intercept trigger event (ActivityTypes.Trigger)
bot.on('trigger', function (message) {
    // handle message from trigger function
    var queuedMessage = message.value;
    var reply = new builder.Message()
        .address(queuedMessage.address)
        .text('This is coming from the trigger: ' + queuedMessage.text);
    bot.send(reply);
});

*/


/*
// Handle message from user
bot.dialog('/', function (session) {
    //session.send('ddddd');
    var queuedMessage = { address: session.message.address, text: session.message.text };
    // add message to queue
    session.sendTyping();
    var queueSvc = azure.createQueueService(process.env.AzureWebJobsStorage);
    queueSvc.createQueueIfNotExists('bot-queue', function(err, result, response){
        if(!err){
            // Add the message to the queue
            var queueMessageBuffer = new Buffer(JSON.stringify(queuedMessage)).toString('base64');
            queueSvc.createMessage('bot-queue', queueMessageBuffer, function(err, result, response){
                if(!err){
                    // Message inserted
                    session.send('Your message (\'' + session.message.text + '\') has been added to a queue, and it will be sent back to you via a Function');
                } else {
                    // this should be a log for the dev, not a message to the user
                    session.send('There was an error inserting your message into queue');
                }
            });
        } else {
            // this should be a log for the dev, not a message to the user
            session.send('There was an error creating your queue');
        }
    });

});
*/

bot.dialog('/', [
    function (session) {
        
            session.sendTyping();
            
            builder.Prompts.text(session, "שלום לך, מי את/ה?"); 

    }, function (session, results) {
            
            session.userData.UserName = results.response;   
            
            session.send("שלום לך: " + session.userData.UserName); 
            
            builder.Prompts.choice(session, "אז איך אני יכול לעזור לך?", "עדכון תגיות פרופיל|עדכון פרופיל אישי|עדכון פרופיל חברה|רישום לאירוע");            

    }, function (session, results) {

            session.userData.UserMenuChoise = results.response.entity;  
            
            if (session.userData.UserMenuChoise == "רישום לאירוע") {
                
                session.beginDialog("/register");
                
            } else if (session.userData.UserMenuChoise == "עדכון פרופיל חברה") {
                
                session.beginDialog("/updateCompanyProfile");
                
            } else if (session.userData.UserMenuChoise == "עדכון פרופיל אישי") {
                
                session.beginDialog("/updateUserProfile");
                
            } else if (session.userData.UserMenuChoise == "עדכון תגיות פרופיל") {
                
                session.beginDialog("/TagUserProfile");
                
            }        

    },
]);








bot.dialog('/updateUserProfile', [
    function (session) {
        
            session.sendTyping();
            
            session.send("נתחיל בעדכון פרטים אישיים: ");
            
            builder.Prompts.text(session, "מה שמך המלא?"); 

    }, function (session, results) {
            
            session.userData.UserFullName = results.response;  
            
            session.sendTyping(); 
            
            builder.Prompts.number(session, "מספר הטלפון?"); 

    }, function (session, results) {
            
            session.userData.UserPhone = results.response;  
            
            session.sendTyping(); 
            
            builder.Prompts.text(session, "כתובת הדוא״ל?"); 

    }, function (session, results) {
            
            session.userData.UserEmail = results.response; 
            
            session.sendTyping();   
            
            builder.Prompts.choice(session, "באיזו רשת חברתית יש לך פרופיל שחשוב לך שאדע עליו?", "Facebook|LinkedIn|Twitter");            

    }, function (session, results) {
            
            session.userData.UserSocialChoise = results.response.entity;   
            
            session.sendTyping(); 
            
            builder.Prompts.text(session, "מה שם הפרופיל שלך שם? ");            

    }, function (session, results) {

            session.userData.UserSocialProfile = results.response;  
            
            session.sendTyping(); 
            
            session.send("אז זה מה שאני יודע עליכם עכשיו... שמכם הוא " + 
              
            session.userData.UserFullName + " ,אתם זמינים בטלפון " +   
            
            session.userData.UserPhone + " , מתכתבים בדוא״ל " +   
            
            session.userData.UserEmail + " ומחוברים לרשת החברתית " +
            
            session.userData.UserSocialChoise + " , בכינוי: " +
            
            session.userData.UserSocialProfile + " , תודה על השיתוף!" 
              
            );
            
            builder.Prompts.choice(session, "מה תרצה לעשות עכשיו?", "לעדכן תגיות פרופיל|לעדכן פרופיל חברה|להירשם לאירוע|לקבל תזכורת על בנושאים שונים"); 

    }, function (session, results) {
            
            session.userData.UserChoiseNext = results.response.entity;  
            
            session.sendTyping(); 
            
            if (session.userData.UserMenuChoise == "לקבל תזכורת בנושאים שונים") {
                
                session.beginDialog("/remindMe");
                
            } else if (session.userData.UserMenuChoise == "לעדכן פרופיל חברה") {
                
                session.beginDialog("/updateUserProfile");
                
            } else if (session.userData.UserMenuChoise == "להירשם לאירוע") {
                
                session.beginDialog("/register");
                
            } else if (session.userData.UserMenuChoise == "לעדכן תגיות פרופיל") {
                
                session.beginDialog("/TagUserProfile");
                
            }             
           

    },
]);



bot.dialog('/TagUserProfile', [
    function (session) {
        
            session.sendTyping();
            
            session.send("כייף לדעת שאנחנו מעמיקים את היכרותינו : ) ");
            
            builder.Prompts.choice(session, "בחרו תגית מתאימה: ", "BLOCKCHAIN|BOT|NODEJS|ANGULAR|FINTECH|MARKETING");  

    }, function (session, results) {
            
            session.userData.UserTagOneChoise = results.response.entity;  
            
            session.sendTyping(); 
            
            session.send("סתם שתדעו, אני יודע על לפחות 50 חברים נוספים שבחרו את התגית הזאת.. ");
            
            builder.Prompts.choice(session, "בחרו תגית נוספת או שאפשר גם לעצור..: ", "BLOCKCHAIN|BOT|NODEJS|ANGULAR|FINTECH|MARKETING|סיימתי"); 

    }, function (session, results) {
            
            session.userData.UserTagTwoChoise = results.response.entity;    
            
            session.sendTyping(); 
            
            session.send("אז אתם טוענים שאלה התגיות שמתארות אתכם: #" + 
              
            session.userData.UserTagOneChoise + " #" +   
            
            session.userData.UserTagTwoChoise );
            
            session.send("צמד התגיות הזה כנראה מככב, כי ישנם עוד 20 חברים שמגדירים את עצמם באמצעות התגיות הללו");
            
            if (session.userData.UserTagTwoChoise == "סיימתי") {
                
                session.EndDialog(""); 
                
            } else {
                
                builder.Prompts.choice(session, "בחרו תגית נוספת או שאפשר גם לעצור..: ", "BLOCKCHAIN|BOT|NODEJS|ANGULAR|FINTECH|MARKETING|סיימתי"); 
                
            } 

    }, function (session, results) {
            
            session.userData.UserTagThreeChoise = results.response.entity;  
            
            session.sendTyping(); 
            
            session.send("אז אתם טוענים שאלה התגיות שמתארות אתכם: #" + 
              
            session.userData.UserTagOneChoise + " #" +   
            
            session.userData.UserTagTwoChoise  + " #" +   
            
            session.userData.UserTagThreeChoise );            
            
            builder.Prompts.choice(session, "בחרו תגית נוספת או שאפשר גם לעצור..: ", "BLOCKCHAIN|BOT|NODEJS|ANGULAR|FINTECH|MARKETING|סיימתי"); 

            if (session.userData.UserTagThreeChoise == "סיימתי") {
                
                session.EndDialog(""); 
                
            } else {
                
                builder.Prompts.choice(session, "בחרו תגית נוספת או שאפשר גם לעצור..: ", "BIGDATA|BLOCKCHAIN|BOT|NODEJS|ANGULAR|FINTECH|MARKETING|סיימתי"); 
                
            }

    }, function (session, results) {
            
            session.userData.UserTagFourChoise = results.response.entity;  
            
            session.sendTyping(); 
            
            session.send("עכשיו אני באמת מרגיש שאנחנו מכירים ואוכל לספק לכם מידע ממוקד ורלוונטי, עם תגיות כאלה: #" + 
              
            session.userData.UserTagOneChoise + " #" +   
            
            session.userData.UserTagTwoChoise  + " #" +   
            
            session.userData.UserTagThreeChoise  + " #" +   
            
            session.userData.UserTagFourChoise );             
            
            builder.Prompts.choice(session, "מה תרצה לעשות עכשיו?", "לעדכן פרופיל חברה|להירשם לאירוע|לקבל תזכורת על בנושאים שונים"); 

    }, function (session, results) {
            
            session.userData.UserChoiseNext = results.response.entity;  
            
            session.sendTyping(); 
            
            if (session.userData.UserMenuChoise == "לקבל תזכורת בנושאים שונים") {
                
                session.beginDialog("/remindMe");
                
            } else if (session.userData.UserMenuChoise == "לעדכן פרופיל חברה") {
                
                session.beginDialog("/updateUserProfile");
                
            } else if (session.userData.UserMenuChoise == "להירשם לאירוע") {
                
                session.beginDialog("/register");
                
            }          

    },
]);








bot.dialog('/register', [
    function (session) {
        
            session.sendTyping();
            
            session.send("אני שמח לדעת שאתם רוצים לקחת חלק.. ");
            
            builder.Prompts.choice(session, "באיזה סוג אירועים הייתם רוצים לקחת חלק?", "כנסי משקיעים|כנסים טכנולוגיים|הכל");  

    }, function (session, results) {
            
            session.userData.UserEventTypeChoise = results.response.entity;  
            
            session.sendTyping(); 
            
            builder.Prompts.choice(session, "באיזה תחום זמן?", "בחודש הקרוב|ברבעון הקרוב|הכל"); 

    }, function (session, results) {
            
            session.userData.UserEventTimeFrameChoise = results.response.entity;    
            
            session.sendTyping(); 
            
            builder.Prompts.choice(session, "אלה האירועים שאני מצאתי עבורך, בחר אירוע כדי להירשם: ", "Fund Raising 2017|Entrepenuer Rocks!|Funding is Dating|Customer are over estimated, or not?");  

    }, function (session, results) {
            
            session.userData.UserEventTimeFrameChoise = results.response.entity;  
            
            session.sendTyping();   
            
            builder.Prompts.choice(session, "תודה על הרשמתך! האם תרצה שאזכיר לך יומיים לפני מועד האירוע על קיומו?","כן|לא");           

    }, function (session, results) {
            
            session.userData.UserEventReminderChoise = results.response.entity;   
            
            session.sendTyping(); 
            
            builder.Prompts.choice(session, "מה תרצה לעשות עכשיו?", "לעדכן פרופיל חברה|לעדכן פרופיל אישי|לקבל תזכורת על בנושאים שונים");           

    }, function (session, results) {
            
            session.userData.UserChoiseNext = results.response.entity;  
            
            session.sendTyping(); 
            
            if (session.userData.UserMenuChoise == "לקבל תזכורת בנושאים שונים") {
                
                session.beginDialog("/register");
                
            } else if (session.userData.UserMenuChoise == "לעדכן פרופיל חברה") {
                
                session.beginDialog("/updateCompanyProfile");
                
            } else if (session.userData.UserMenuChoise == "לעדכן פרופיל אישי") {
                
                session.beginDialog("/updateUserProfile");
                
            }             
           

    },
]);





bot.dialog('/UserFeedback', [
    function (session) {
        
            session.sendTyping();
            
            session.send("תודה שלקחתם חלק בכנס המשקיעים של כולנו!");
            
            builder.Prompts.choice(session, "איך הייתם מדרגים את שביעות רצונכם מהכנס", "מעולה!|מיותר|אני עוד מתלבט");  

    }, function (session, results) {
            
            session.userData.UserEventFeedbackGen = results.response.entity;  
            
            session.sendTyping();
            
            builder.Prompts.choice(session, "האם מצאתם משקיע רלוונטי", "כן|לא|עובד על זה");  

    }, function (session, results) {
            
            session.userData.UserEventFeedbackFunder = results.response.entity;    
            
            session.sendTyping(); 
            
            builder.Prompts.choice(session, "אתם צריכים עזרה כלשהי כרגע?", "כן בחיבור טוב יותר|לא, אנחנו מסתדרים|בדוק איתי שוב בעוד שבוע");

    }, function (session, results) {
            
            session.userData.UserEventFeedbackFunderHelp = results.response.entity;  
            
            session.sendTyping(); 
                         
            session.send("תודה על הפידבק!");

    },
]);









bot.dialog('restartDialog', function (session, args) {

    session.userData.authanticated = 'false';

    session.beginDialog("/");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/restart':
                // You can trigger the action with callback(null, 1.0) but you're also
                // allowed to return additional properties which will be passed along to
                // the triggered dialog.
                callback(null, 1.0, { topic: 'restart' });
                break;
            default:
                callback(null, 0.0);
                break;
        }
    } 
});



bot.dialog('UserFeedbackDialog', function (session, args) {

    session.userData.authanticated = 'false';

    session.beginDialog("/UserFeedback");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/feedback':
                // You can trigger the action with callback(null, 1.0) but you're also
                // allowed to return additional properties which will be passed along to
                // the triggered dialog.
                callback(null, 1.0, { topic: 'restart' });
                break;
            default:
                callback(null, 0.0);
                break;
        }
    } 
});



bot.dialog('TagUserProfileDialog', function (session, args) {

    session.userData.authanticated = 'false';

    session.beginDialog("/TagUserProfile");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/tag':
                // You can trigger the action with callback(null, 1.0) but you're also
                // allowed to return additional properties which will be passed along to
                // the triggered dialog.
                callback(null, 1.0, { topic: 'restart' });
                break;
            default:
                callback(null, 0.0);
                break;
        }
    } 
});





if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}


