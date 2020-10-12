$(function () {
    console.log("starting loading home games from IFV");

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.el-pl.ch/de/erste-liga/organisation-el/vereine-erste-liga/verein-1l.aspx/v-331/a-hs/"; // site that doesn’t send Access-Control-*

    const loadingText = "Daten werden geladen...";

    //setting up loading message
    $("#upcoming-games").append(loadingText);

    fetch(proxyurl + url)
        .then(response => response.text())
        .then(function (data) {
            addContents($(data).find("#ctl01_ctl10_VereinMasterObject_ctl01_tbResultate")[0]);
        })
        .catch(() => console.log("Can’t access " + url + " response. It was blocked or an error occured"));


});

function addContents(contents) {
    var finalDayOfGameweek = false;
    var dateLastDayOfGameWeek = recursiveGamedayFinder(contents, 7); //starting with day 7 (sunday)

    //remove loading text
    $("#upcoming-games")[0].innerText = '';

    $(contents).children().each(function (index) {
        //Game Date
        if ($(this).hasClass('sppTitel')) {
            if (finalDayOfGameweek) { //break if final Day of Gameweek is reached
                return false;
            }

            if ($(this).html().trim() === dateLastDayOfGameWeek) { //set day as final day if dates match
                finalDayOfGameweek = true;
                console.log("Last Day of gameweek: " + dateLastDayOfGameWeek);
            }

            $("#upcoming-games").append($(this));
        }
        //Game itself
        else {
            if ($(this).find('.spiel').children().first().html().trim() !== "") {
                formatGameInfo($(this).find('.spiel').children().eq(2)[0]);

                $("#upcoming-games").append($(this));
            }
        }
    })
}

function formatGameInfo(gameInfo) {
    const mainPitch = "Sportanlage \"Tierpark\" Goldau - Hauptspielfeld (1) Tierpark, Goldau";
    const synteticPitch = "Sportanlage \"Tierpark\" Goldau - Kunststoffrasen (PHZ), Goldau";
    const sidePitch = "Sportanlage \"Tierpark\" Goldau - Nebenplatz (2), Goldau";
    const leagueGame = "Meisterschaft";
    const cup = "Cup";

    var pitch;
    if (gameInfo.innerText.indexOf(mainPitch) >= 0) {
        pitch = 'Hauptspielfeld';
    } else if (gameInfo.innerText.indexOf(synteticPitch) >= 0) {
        pitch = 'Kunstrasen';
    } else if (gameInfo.innerText.indexOf(sidePitch) >= 0) {
        pitch = 'Nebenplatz';
    }
    else {
        pitch = 'unbekannt';
        console.log('pitch unknown');
    }

    var type = 1; // 0 = Meisterschaft, 1 = Cup
    if (gameInfo.innerText.indexOf(leagueGame) >= 0) {
        type = 0;
    }

    gameInfo.innerText = gameInfo.innerText.trim().split(" ", 3).join(' ');
    if (gameInfo.innerText.substr(-1) !== '-') {
        gameInfo.innerText = gameInfo.innerText + ' - '
    }
    gameInfo.innerText = gameInfo.innerText.replace('(Spielzeit', '');
    gameInfo.innerText = gameInfo.innerText + ' ' + pitch;

    //check if game type is set in the gameInfo string, else set to start of gameInfo string
    if (gameInfo.innerText.indexOf(type == 1 ? cup : leagueGame) < 0) {
        gameInfo.innerText = (type == 1 ? cup : leagueGame) + ' ' + gameInfo.innerText;
    }
}

/**
 * calculates the last Gameday of the gameweek, on which games are played
 * params
 * contents [content list of all games]
 * dayOfWeekIndex [int] 1 (Mon) - 7 (Sun)
 */
function recursiveGamedayFinder(contents, dayOfWeekIndex) {
    var dateLastDayOfGameWeek = formatDateString(nextWeekdayDate(new Date(), dayOfWeekIndex));

    //check if last date of gameweek is present in loaded game list
    if (contents.textContent.indexOf(dateLastDayOfGameWeek) < 0) {
        return recursiveGamedayFinder(contents, dayOfWeekIndex - 1);
    }
    else {
        return dateLastDayOfGameWeek;
    }
}

/**
 * params
 * date [JS Date()]
 * day_in_week [int] 1 (Mon) - 7 (Sun)
 */
function nextWeekdayDate(date, day_in_week) {
    var ret = new Date(date || new Date());
    ret.setDate(ret.getDate() + (day_in_week - 1 - ret.getDay() + 7) % 7 + 1);
    return ret;
}

function formatDateString(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    return getDayOfWeekShortText(date) + ' ' + dd + '.' + mm + '.' + yyyy;
}

function getDayOfWeekShortText(date) {
    var weekday = new Array(7);
    weekday[0] = "So";
    weekday[1] = "Mo";
    weekday[2] = "Di";
    weekday[3] = "Mi";
    weekday[4] = "Do";
    weekday[5] = "Fr";
    weekday[6] = "Sa";

    return weekday[date.getDay()];
}