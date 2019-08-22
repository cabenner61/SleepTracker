// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
const Alexa = require('ask-sdk-core');
// BASELINE
// used the sample to build Sleep Tracker's WellRestedIntent()
// Note: also removed HelloWorld intent handler from sample
//       changed responses in HelpIntentHandler and LaunchRequestHandler accordingly
//
// BEGIN Version 0.3
// add some variety to speech responses
// implement pluck() and WellRestedPhrases
//
function pluck (arr) {
  const randIndex = Math.floor(Math.random() * arr.length);
  return arr[randIndex];
}

const WellRestedPhrases = {
  tooMuch: [
    "I think you may sleep too much and swing back to tired.",
    "whoa, that's a lot of sleep. You'll wake up rested for sure."
  ],
  justRight: [
    "you should wake up refreshed.",
    "it's clear you know rest is important. Good job.",
    "it's clear you know rest is important. Good job!",
    "with that much sleep, you're ready to face the world.",
    "you'll wake up invigorated."
  ],
  justUnder: [
    "you may get by, but watch out for a mid-day crash.",
    "you'll be alright, but would be better off with a bit more time.",
    "you might be a little tired tomorrow."
  ],
  tooLittle: [
    "you'll be dragging tomorrow. Get the coffee ready!",
    "that's either a long night or early morning? Either way, tomorrow's going to be rough."
  ]
};
// END Version 0.3;

const WellRestedIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "WellRestedIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
           handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  handle(handlerInput) {
      const slots = handlerInput
                      .requestEnvelope
                      .request
                      .intent
                      .slots;

    const numOfHours = slots.NumberOfHours.value;
    let adjustedHours = parseInt(numOfHours);

    const quality = slots.SleepQuality && slots.SleepQuality.value;

    const good = ["good", "well", "wonderfully", "a lot", "amazing",
                  "fantastic", "great", "not bad"];
    const bad = ["bad", "poorly", "little", "very little", "not at all"];

    if (Number.isInteger(adjustedHours)) {
      let speech = "";

      if(good.includes(quality)) {
        adjustedHours += 1;
        speech = "You slept well last night, and ";
      }

      if(bad.includes(quality)) {
        adjustedHours -= 1;
        speech = "You slept poorly last night, and ";
      }

      if(adjustedHours > 12) {
            speech += pluck(WellRestedPhrases.tooMuch);
      } else if(adjustedHours > 8) {
            speech += pluck(WellRestedPhrases.justRight);
      } else if(adjustedHours > 6) {
            speech += pluck(WellRestedPhrases.justUnder);
      } else {
            speech += pluck(WellRestedPhrases.tooLittle);
      }

      return handlerInput
              .responseBuilder
              .speak(speech)
              .getResponse();
    } else {
      console.log("Slot values ", slots);

      const speech = "Oh, I don't know what happened. Tell me again. " +
                     "How many hours will you sleep tonight?";
      const reprompt = "How many hours are you going to sleep tonight?";

      return handlerInput
              .responseBuilder
              .speak(speech)
              .reprompt(reprompt)
              .getResponse();
    }
  }  // end WellRestedIntentHandler.handle()
};  // end WellRestedIntentHandler

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can ask about sleeping or say Help. Which would you like to try?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask, for example, How rested will I be if I get 6 hours of sleep';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
//      begin changes Sleep Tracker's WellRestedIntent()
        WellRestedIntentHandler,
//      end changes Sleep Tracker's WellRestedIntent()
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
