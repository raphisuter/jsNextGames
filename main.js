$(function () {
    console.log("ready!");

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.el-pl.ch/de/erste-liga/organisation-el/vereine-erste-liga/verein-1l.aspx/v-331/a-as/"; // site that doesn’t send Access-Control-*

    var dateLastGameOfWeek = formatDateString(nextWeekdayDate(new Date(), 7));
    console.log("Last Gameday of the Week: " + dateLastGameOfWeek);

    fetch(proxyurl + url)
        .then(response => response.text())
        .then(function (data) {
            addContents($(data).find("#ctl01_ctl10_VereinMasterObject_ctl01_tbResultate")[0], dateLastGameOfWeek);
        })
        .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"));


});


function addContents(contents, endDate) {
    var type = "";
    var finalDayOfGameweek = false;

    $(contents).children().each(function (index) {
        if ($(this).hasClass('sppTitel')) {
            type = 0 //gamedate;

            if (finalDayOfGameweek) {
                return false; //break
            }
        } else {
            type = 1 //game;
        }

        console.log($(this))

        if (type == 0 && $(this).html().trim() === endDate) {
            finalDayOfGameweek = true;
        }
        $("#upcoming-games").append($(this));
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