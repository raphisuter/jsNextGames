$(function () {
    console.log("starting loading home games from IFV");

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.el-pl.ch/de/erste-liga/organisation-el/vereine-erste-liga/verein-1l.aspx/v-331/a-hs/"; // site that doesn’t send Access-Control-*

    fetch(proxyurl + url)
        .then(response => response.text())
        .then(function (data) {
            addContents($(data).find("#ctl01_ctl10_VereinMasterObject_ctl01_tbResultate")[0]);
        })
        .catch(() => console.log("Can’t access " + url + " response. It was blocked or an error occured"));


});

function addContents(contents) {
    var finalDayOfGameweek = false;
    var dateLastDayOfGameWeek = formatDateString(nextWeekdayDate(new Date(), 7));

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
                formatGamePitchInGameInfos($(this).find('.spiel').children().eq(2)[0]);

                $("#upcoming-games").append($(this));
            }
        }
    })
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

function formatGamePitchInGameInfos(gameInfos) {
    const mainPitch = "Sportanlage \"Tierpark\" Goldau - Hauptspielfeld (1) Tierpark, Goldau";
    const synteticPitch = "Sportanlage \"Tierpark\" Goldau - Kunststoffrasen (PHZ), Goldau";
    const sidePitch = "Sportanlage \"Tierpark\" Goldau - Nebenplatz (2), Goldau";

    var pitch;
    if (gameInfos.innerText.indexOf(mainPitch) >= 0) {
        pitch = 'Hauptspielfeld';
    } else if (gameInfos.innerText.indexOf(synteticPitch) >= 0) {
        pitch = 'Kunstrasen';
    } else if (gameInfos.innerText.indexOf(sidePitch) >= 0) {
        pitch = 'Nebenplatz';
    }
    else {
        pitch = 'unbekannt';
        console.log('pitch unknown');
    }

    gameInfos.innerText = gameInfos.innerText.trim().split(" ", 3).join(' ');
    if (gameInfos.innerText.substr(-1) !== '-') {
        gameInfos.innerText = gameInfos.innerText + ' - '
    }
    gameInfos.innerText = gameInfos.innerText + pitch;
}