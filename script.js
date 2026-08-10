
/* =========================
    SETTINGS
========================= */

const people = ["Erikas", "Ernesta"];

const SUPABASE_URL = "https://cazdfsktnfyejbmswoyl.supabase.co";
const SUPABASE_KEY = "sb_publishable__3FGVVurP33EHveTGPCHVQ_DFWzei7S";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let schedule = {};


let currentDate = new Date();

let currentYear = currentDate.getFullYear();

let currentMonth = currentDate.getMonth();


let selectedDay = null;

async function loadSchedule() {

    const { data, error } = await supabaseClient
        .from("schedule")
        .select("*");

    if (error) {
        console.error("Failed to load schedule:", error);
        return;
    }

    schedule = {};

    for (const row of data) {

        schedule[row.date] = {
            People: row.people
        };

    }

    drawCalendar();
}


function createTimeOptions() {

    const selects = [

        document.getElementById("erikasStart"),
        document.getElementById("erikasEnd"),
        document.getElementById("gfStart"),
        document.getElementById("gfEnd")

    ];


    for (let hour = 0; hour < 24; hour++) {

        for (let minute of [0, 30]) {

            let time =
                String(hour).padStart(2, "0")
                + ":"
                + String(minute).padStart(2, "0");


            selects.forEach(select => {

                let option =
                    document.createElement("option");

                option.value = time;

                option.textContent = time;

                select.appendChild(option);

            });

        }

    }

}

function dateKey(year, month, day) {

    return (
        year
        + "-"
        + String(month + 1).padStart(2, "0")
        + "-"
        + String(day).padStart(2, "0")
    );

}

function drawCalendar() {

    const calendar =
        document.getElementById("calendar");


    calendar.innerHTML = "";


    const monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    document.getElementById("monthTitle").textContent =
        monthNames[currentMonth]
        + " "
        + currentYear;


    /*
        JavaScript starts weeks on Sunday.

        Convert it so Monday = 0.
    */

    let firstDay =
        new Date(
            currentYear,
            currentMonth,
            1
        ).getDay();


    firstDay =
        firstDay === 0
            ? 6
            : firstDay - 1;


    const daysInMonth =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();


    /* Empty cells before month */

    for (let i = 0; i < firstDay; i++) {

        const empty =
            document.createElement("div");

        empty.className =
            "day empty-day";

        calendar.appendChild(empty);

    }


    /* Days */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const key =
            dateKey(
                currentYear,
                currentMonth,
                day
            );


        const dayElement =
            document.createElement("div");


        dayElement.className = "day";


        /*
            Today
        */

        const today =
            new Date();


        if (
            day === today.getDate()
            &&
            currentMonth === today.getMonth()
            &&
            currentYear === today.getFullYear()
        ) {

            dayElement.classList.add("today");

        }


        /*
            Day number
        */

        const number =
            document.createElement("div");

        number.className =
            "day-number";

        number.textContent =
            day;


        dayElement.appendChild(number);


        /*
            Get schedule
        */

        const data =
            schedule[key];


        let me = {};

        let gf = {};


        if (data && data.People) {

            me =
                data.People.Erikas || {};

            gf =
                data.People.Ernesta || {};

        }


        /*
            My shift
        */

        const myShift =
            document.createElement("div");

        myShift.className =
            "shift";


        if (me.off) {

            myShift.classList.add(
                "day-off"
            );

            myShift.textContent =
                "OFF";

        }

        else if (
            me.start &&
            me.end
        ) {

            /*
                Night shift
            */

            if (
                me.start >= "18:00"
                ||
                me.end <= "06:00"
            ) {

                myShift.classList.add(
                    "my-night-shift"
                );

            }

            else {

                myShift.classList.add(
                    "my-shift"
                );

            }


            myShift.textContent =
                me.start
                + "-"
                + me.end;

        }


        dayElement.appendChild(
            myShift
        );


        /*
            Girlfriend shift
        */

        const gfShift =
            document.createElement("div");

        gfShift.className =
            "shift";


        if (gf.off) {

            gfShift.classList.add(
                "day-off"
            );

            gfShift.textContent =
                "OFF";

        }

        else if (
            gf.start &&
            gf.end
        ) {

            gfShift.classList.add(
                "gf-shift"
            );

            gfShift.textContent =
                gf.start
                + "-"
                + gf.end;

        }


        dayElement.appendChild(
            gfShift
        );


        /*
            Double click
        */

        dayElement.addEventListener(
            "dblclick",
            () => openEditor(day)
        );


        calendar.appendChild(
            dayElement
        );

    }


    calculateStatistics();

}

function previousMonth() {

    currentMonth--;

    if (currentMonth < 0) {

        currentMonth = 11;
        currentYear--;

    }

    drawCalendar();

}

function nextMonth() {

    currentMonth++;

    if (currentMonth > 11) {

        currentMonth = 0;
        currentYear++;

    }

    drawCalendar();

}

function openEditor(day) {

    selectedDay = day;


    const key =
        dateKey(
            currentYear,
            currentMonth,
            day
        );


    const data =
        schedule[key]
        || {
            People: {}
        };


    const me =
        data.People.Erikas
        || {
            off: false,
            start: "",
            end: ""
        };


    const gf =
        data.People.Girlfriend
        || {
            off: false,
            start: "",
            end: ""
        };


    document.getElementById(
        "modalTitle"
    ).textContent =
        day
        + " "
        + new Date(
            currentYear,
            currentMonth,
            day
        ).toLocaleString(
            "en-US",
            { month: "long" }
        );


    /*
        Erikas
    */

    document.getElementById(
        "erikasOff"
    ).checked =
        me.off || false;


    if (me.start) {

        document.getElementById(
            "erikasStart"
        ).value = me.start;

    }


    if (me.end) {

        document.getElementById(
            "erikasEnd"
        ).value = me.end;

    }


    /*
        Girlfriend
    */

    document.getElementById(
        "gfOff"
    ).checked =
        gf.off || false;


    if (gf.start) {

        document.getElementById(
            "gfStart"
        ).value = gf.start;

    }


    if (gf.end) {

        document.getElementById(
            "gfEnd"
        ).value = gf.end;

    }


    togglePerson("erikas");
    togglePerson("gf");


    document.getElementById(
        "modalBackground"
    ).classList.add("active");

}

function togglePerson(person) {

    const off =
        document.getElementById(
            person + "Off"
        ).checked;


    document.getElementById(
        person + "Start"
    ).disabled = off;


    document.getElementById(
        person + "End"
    ).disabled = off;

}

function saveDay() {

    const key =
        dateKey(
            currentYear,
            currentMonth,
            selectedDay
        );


    const erikasOff =
        document.getElementById(
            "erikasOff"
        ).checked;


    const gfOff =
        document.getElementById(
            "gfOff"
        ).checked;


    schedule[key] = {

        People: {

            Erikas: {

                off: erikasOff,

                start:
                    erikasOff
                        ? ""
                        : document.getElementById(
                            "erikasStart"
                            ).value,

                end:
                    erikasOff
                        ? ""
                        : document.getElementById(
                            "erikasEnd"
                            ).value

            },


            Girlfriend: {

                off: gfOff,

                start:
                    gfOff
                        ? ""
                        : document.getElementById(
                            "gfStart"
                            ).value,

                end:
                    gfOff
                        ? ""
                        : document.getElementById(
                            "gfEnd"
                            ).value

            }

        }

    };


    closeModal();

    drawCalendar();

}

function closeModal() {

    document.getElementById(
        "modalBackground"
    ).classList.remove("active");

}

function calculateHours(start, end) {

    if (!start || !end)
        return 0;

    let [sh, sm] = start.split(":").map(Number);
    let [eh, em] = end.split(":").map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
    }

    return (endMinutes - startMinutes) / 60;
}
function calculateShift(start, end) {

    if (!start || !end) {
        return {
            normal: 0,
            night: 0
        };
    }

    let [sh, sm] = start.split(":").map(Number);
    let [eh, em] = end.split(":").map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
    }

    let normal = 0;
    let night = 0;

    // Check every 30 minutes
    for (
        let time = startMinutes;
        time < endMinutes;
        time += 30
    ) {

        let hour = Math.floor((time % 1440) / 60);

        // 22:00 - 06:00 = night
        if (hour >= 22 || hour < 6) {
            night += 0.5;
        } else {
            normal += 0.5;
        }
    }

    return {
        normal: normal,
        night: night
    };
}


function calculateStatistics() {

    let myNormalHours = 0;
    let myNightHours = 0;

    let gfHours = 0;

    const prefix =
        currentYear
        + "-"
        + String(currentMonth + 1).padStart(2, "0");


    for (const [date, data] of Object.entries(schedule)) {

        if (!date.startsWith(prefix))
            continue;


        const me =
            data.People?.[people[0]];

        const gf =
            data.People?.[people[1]];


        // =========================
        // ERIKAS
        // =========================

        if (
            me &&
            !me.off &&
            me.start &&
            me.end
        ) {

            const shift =
                calculateShift(
                    me.start,
                    me.end
                );

            myNormalHours += shift.normal;
            myNightHours += shift.night;
        }


        // =========================
        // ERNESTA
        // =========================

        if (
            gf &&
            !gf.off &&
            gf.start &&
            gf.end
        ) {

            // 1 hour unpaid lunch
            gfHours += Math.max(
                0,
                calculateHours(
                    gf.start,
                    gf.end
                ) - 1
            );
        }
    }


    // =========================
    // TOTAL HOURS
    // =========================

    const myHours =
        myNormalHours + myNightHours;


    // =========================
    // GROSS PAY
    // =========================

    const myGross =
        myNormalHours * 11.24
        +
        myNightHours * (11.24 * 1.5);


    const gfGross =
        gfHours * 7.70;


    // =========================
    // NET PAY
    // =========================

    const myNet =
        calculateNet(myGross);

    const gfNet =
        calculateNet(gfGross);


    // =========================
    // DISPLAY
    // =========================

    document.getElementById(
        "myHours"
    ).textContent =
        myHours.toFixed(1) + "h";


    document.getElementById(
        "gfHours"
    ).textContent =
        gfHours.toFixed(1) + "h";


    document.getElementById(
        "myGross"
    ).textContent =
        "€" + myGross.toFixed(2);


    document.getElementById(
        "gfGross"
    ).textContent =
        "€" + gfGross.toFixed(2);


    document.getElementById(
        "myNet"
    ).textContent =
        "€" + myNet.toFixed(2);


    document.getElementById(
        "gfNet"
    ).textContent =
        "€" + gfNet.toFixed(2);
}

function calculateNet(gross) {

    // Employee social contributions
    const employeeSocial =
        gross * 0.195;


    // NPD
    let npd = 0;

    if (gross <= 2387.29) {

        npd = Math.max(
            0,
            747 - 0.49 * (gross - 1038)
        );

    }


    // GPM
    const gpm =
        Math.max(
            0,
            (gross - employeeSocial - npd) * 0.20
        );


    const net =
        gross
        - employeeSocial
        - gpm;


    return Math.max(0, net);
}


createTimeOptions();
loadSchedule();