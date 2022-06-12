/**
 *  These are defaults based on the "fields" tab in the widget editor.
 *  If something isn't explicitly set or specified here, this is used
 *  for a fallback value in the event that some data you set doesn't come through.
 */
const CONFIG_DEFAULTS = {
    eventsLimit        : 5,
    userLocale         : "en-US",
    includeFollowers   : true,
    includeRedemptions : true,
    includeHosts       : true,
    minHost            : 0,
    includeRaids       : true,
    minRaid            : 0,
    includeSubs        : true,
    includeTips        : true,
    minTip             : 0,
    includeCheers      : true,
    direction          : "top",
    textOrder          : "nameFirst",
    minCheer           : 0,

    _include : [ "follower", "redemption", "host", "raid", "subscriber", "tip", "cheer" ],
};

const config = {};

let totalEvents = 0;
let _userCurrency;

const process = {
    follower   : (event) => addEvent(event.type, "Follower", event.name),
    redemption : (event) => addEvent(event.type, "Redeemed", event.name),

    subscriber : (event) => {
        const { amount } = event;

        return addEvent(
            event.type,
            amount === "gift" ? "Sub gift" : `Sub X${event.amount}`,
            event.name
        );
    },

    host : (event) => {
        const { amount = 0 } = event;

        if(amount < config.minHost) {
            return;
        }

        return addEvent(event.type, `Host ${amount.toLocaleString()}`, event.name);
    },

    cheer : (event) => {
        const { amount = 0 } = event;

        if(amount < config.minCheer) {
            return;
        }

        return addEvent("cheer", `${amount.toLocaleString()} Bits`, event.name);
    },

    tip : (event) => {
        const { amount = 0 } = event;

        console.log("tip", { amount, min : config.minTip });

        if(amount < config.minTip) {
            return;
        }
        
        return addEvent(event.type, amount.toLocaleString(config.userLocale, {
            style    : "currency",
            currency : _userCurrency.code,
        }), event.name);
    },

    raid : (event) => {
        const { amount = 0 } = event;

        if(amount < config.minRaid) {
            return;
        }

        addEvent(event.type, `Raid ${amount.toLocaleString()}`, event.name);
    },
};

window.addEventListener("onEventReceived", (obj) => {
    const { event } = obj.detail;
    const { listener: _listener } = obj.detail;

    /** If we don't get any event data, we're leaving this function. */
    if(!event) {
      return;
    }

    const [ listener ] = _listener.split("-");

    if(!(event.type in process)) {
        return;
    }
    
    console.log({
        listener, event,
       });

    process[event.type](event);
    
//     if(listener) {
//         if(event.type in process) {
//             console.log("listener was valid", event.type);
//         }

// if(listener === "follower") {
//             addEvent("follower", "Follower", event.name);
//     } else if(listener === "redemption") {
//             addEvent("redemption", "Redeemed", event.name);
//     } else if(listener === "subscriber") {
//             if(event.gifted) {
//                 addEvent("sub", `Sub gift`, event.name);
//             } else {
//                 addEvent("sub", `Sub X${event.amount}`, event.name);
//             }
//     } else if(listener === "host") {
//             addEvent("host", `Host ${event.amount.toLocaleString()}`, event.name);
//     } else if(listener === "cheer") {
//             addEvent("cheer", `${event.amount.toLocaleString()} Bits`, event.name);
//     } else if(listener === "tip") {
//         if(config.includeTips && config.minTip <= event.amount) {
//             if(event.amount === parseInt(event.amount)) {
//                 addEvent("tip", event.amount.toLocaleString(config.userLocale, {
//                     style                 : "currency",
//                     minimumFractionDigits : 0,
//                     currency              : _userCurrency.code,
//                 }), event.name);
//             } else {
//                 addEvent("tip", event.amount.toLocaleString(config.userLocale, {
//                     style    : "currency",
//                     currency : _userCurrency.code,
//                 }), event.name);
//             }
//         }
//     } else if(listener === "raid") {
//         if(config.includeRaids && config.minRaid <= event.amount) {
//             addEvent("raid", `Raid ${event.amount.toLocaleString()}`, event.name);
//         }
//     }
// }
});

/**
 * This widget loading gives us some one time things:
 * 1. Currency of the user
 * 2. Field data from the editor for custom fields
 */
window.addEventListener("onWidgetLoad", ({ detail }) => {
    const { recents, fieldData, currency } = detail;

    _userCurrency = currency;

    /** Merge the field data from the widget into the defaults, overriding the defaults */
    Object.assign(config, CONFIG_DEFAULTS, fieldData);

    console.log({ configggggg : config });

    recents.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

    // recents.forEach((event) => {
    //     eventize(event);
    // });

    let eventIndex;

    for(eventIndex = 0; eventIndex < recents.length; eventIndex++) {
        const event = recents[eventIndex];

        console.log({ event, type : event.type });
        process[event.type](event);
    }
});

// const eventize = (event) => {
//     const { type, username } = event;
//     const text = mapping[event.type].content(event);

//     const element = `
//     <div class="event-container" id="event-${totalEvents}">
//         <div class="backgroundsvg"></div>
//         <div class="event-image event-${type}"></div>
//         <div class="username-container">${text}</div>
//        <div class="details-container">${username}</div>
//     </div>
//     `;

//     const container = document.querySelector(".main-container").append();
// };

function addEvent(type, text, username) {
    totalEvents += 1;
    let element;

    console.log("ya called me!", {
 type, text, username, type,
 });

    /**
     * If our config doesn't specify we're including a specific type of event
     * e.g. (follower, sub, tip, cheer, etc) we're going to stop processing immediately
     * because we don't care about this event.
     * */
    if(!config._include.includes(type)) {
        return;
    }

    if(config.textOrder === "actionFirst") {
        element = `
    <div class="event-container" id="event-${totalEvents}">
        <div class="backgroundsvg"></div>
        <div class="event-image event-${type}"></div>
        <div class="username-container">${text}</div>
       <div class="details-container">${username}</div>
    </div>`;
    } else {
        element = `
    <div class="event-container" id="event-${totalEvents}">
        <div class="backgroundsvg"></div>
        <div class="event-image event-${type}"></div>
        <div class="username-container">${username}</div>
       <div class="details-container">${text}</div>
    </div>`;
    }

    if(config.direction === "bottom") {
        $(".main-container").removeClass("fadeOutClass")
.show()
.append(element);
    } else {
        $(".main-container").removeClass("fadeOutClass")
.show()
.prepend(element);
    }

    if(config.fadeoutTime !== 999) {
        $(".main-container").addClass("fadeOutClass");
    }

    if(totalEvents > config.eventsLimit) {
        removeEvent(totalEvents - config.eventsLimit);
    }
}

function removeEvent(eventId) {
    $(`#event-${eventId}`).animate({
        height  : 0,
        opacity : 0,
    }, "slow", () => {
        $(`#event-${eventId}`).remove();
    });
}
