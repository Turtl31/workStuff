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
                String(hour).padStart(2, "0") +
                ":" +
                String(minute).padStart(2, "0");

            selects.forEach(select => {

                let option = document.createElement("option");

                option.value = time;
                option.textContent = time;

                select.appendChild(option);

            });
        }
    }
}


function dateKey(year, month, day) {

    return (
        year +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        String(day).padStart(2, "0")
    );
}


function drawCalendar() {

    const calendar = document.getElementById("calendar");

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
        monthNames[currentMonth] +
        " " +
        currentYear;


    let firstDay = new Date(
        currentYear,
        currentMonth,
        1
    ).getDay();


    firstDay = firstDay === 0
        ? 6
        : firstDay - 1;


    const daysInMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
    ).getDate();


    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");

        empty.className = "day empty-day";

        calendar.appendChild(empty);
    }


    for (let day = 1; day <= daysInMonth; day++) {

        const key = dateKey(
            currentYear,
            currentMonth,
            day
        );


        const dayElement = document.createElement("div");

        dayElement.className = "day";


        const data = schedule[key];

        let me = {};
        let gf = {};


        if (data && data.People) {

            me = data.People.Erikas || {};
            gf = data.People.Ernesta || {};

        }


        const bothOff =
            me.off === true &&
            gf.off === true;


        const today = new Date();


        if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear() &&
            !bothOff
        ) {

            dayElement.classList.add("today");

        }


        if (bothOff) {

            dayElement.classList.add("both-off");

        }


        const number = document.createElement("div");

        number.className = "day-number";

        number.textContent = day;

        dayElement.appendChild(number);


        // =========================
        // ERIKAS SHIFT
        // =========================

        const myShift = document.createElement("div");

        myShift.className = "shift";


        if (me.off) {

            myShift.classList.add("day-off");

            myShift.textContent = "";

        }

        else if (me.start && me.end) {

            if (
                me.start >= "18:00" ||
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
                me.start +
                "-" +
                me.end;
        }


        dayElement.appendChild(myShift);


        // =========================
        // ERNESTA SHIFT
        // =========================

        const gfShift = document.createElement("div");

        gfShift.className = "shift";


        if (gf.off) {

            gfShift.classList.add("day-off");

            gfShift.textContent = "";

        }

        else if (gf.start && gf.end) {

            gfShift.classList.add("gf-shift");

            gfShift.textContent =
                gf.start +
                "-" +
                gf.end;

        }


        dayElement.appendChild(gfShift);


        dayElement.addEventListener(
            "dblclick",
            () => openEditor(day)
        );


        calendar.appendChild(dayElement);
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


    const key = dateKey(
        currentYear,
        currentMonth,
        day
    );


    const data =
        schedule[key] ||
        {
            People: {}
        };


    const me =
        data.People?.Erikas ||
        {
            off: false,
            extra: false,
            start: "",
            end: ""
        };


    const gf =
        data.People?.Ernesta ||
        {
            off: false,
            extra: false,
            start: "",
            end: ""
        };


    document.getElementById("modalTitle").textContent =
        day +
        " " +
        new Date(
            currentYear,
            currentMonth,
            day
        ).toLocaleString(
            "en-US",
            {
                month: "long"
            }
        );


    // =========================
    // ERIKAS
    // =========================

    document.getElementById("erikasOff").checked =
        me.off || false;


    document.getElementById("erikasExtra").checked =
        me.extra || false;


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


    // =========================
    // ERNESTA
    // =========================

    document.getElementById("gfOff").checked =
        gf.off || false;


    document.getElementById("gfExtra").checked =
        gf.extra || false;


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


    // Extra is also disabled when the person
    // is marked as off

    const extra =
        document.getElementById(
            person + "Extra"
        );

    if (extra) {

        extra.disabled = off;

    }
}


async function saveDay() {

    const key = dateKey(
        currentYear,
        currentMonth,
        selectedDay
    );


    const erikasOff =
        document.getElementById(
            "erikasOff"
        ).checked;


    const ernestaOff =
        document.getElementById(
            "gfOff"
        ).checked;


    const erikasExtra =
        document.getElementById(
            "erikasExtra"
        ).checked;


    const ernestaExtra =
        document.getElementById(
            "gfExtra"
        ).checked;


    schedule[key] = {

        People: {

            Erikas: {

                off: erikasOff,

                extra: erikasOff
                    ? false
                    : erikasExtra,

                start: erikasOff
                    ? ""
                    : document.getElementById(
                        "erikasStart"
                    ).value,

                end: erikasOff
                    ? ""
                    : document.getElementById(
                        "erikasEnd"
                    ).value
            },


            Ernesta: {

                off: ernestaOff,

                extra: ernestaOff
                    ? false
                    : ernestaExtra,

                start: ernestaOff
                    ? ""
                    : document.getElementById(
                        "gfStart"
                    ).value,

                end: ernestaOff
                    ? ""
                    : document.getElementById(
                        "gfEnd"
                    ).value
            }

        }

    };


    const success =
        await saveDayToDatabase(key);


    if (!success) {

        return;

    }


    closeModal();

    drawCalendar();
}


async function saveDayToDatabase(key) {

    const { error } =
        await supabaseClient
            .from("schedule")
            .upsert({

                date: key,

                people:
                    schedule[key].People

            });


    if (error) {

        console.error(
            "Database save error:",
            error
        );

        alert(
            "Failed to save the schedule."
        );

        return false;
    }


    console.log(
        "Saved:",
        key
    );

    return true;
}


function closeModal() {

    document.getElementById(
        "modalBackground"
    ).classList.remove("active");
}


function calculateHours(start, end) {

    if (!start || !end)

        return 0;


    let [sh, sm] =
        start.split(":").map(Number);


    let [eh, em] =
        end.split(":").map(Number);


    let startMinutes =
        sh * 60 + sm;


    let endMinutes =
        eh * 60 + em;


    if (endMinutes <= startMinutes) {

        endMinutes += 24 * 60;

    }


    return (
        endMinutes -
        startMinutes
    ) / 60;
}


function calculateShift(start, end) {

    if (!start || !end) {

        return {
            normal: 0,
            night: 0
        };

    }


    let [sh, sm] =
        start.split(":").map(Number);


    let [eh, em] =
        end.split(":").map(Number);


    let startMinutes =
        sh * 60 + sm;


    let endMinutes =
        eh * 60 + em;


    if (endMinutes <= startMinutes) {

        endMinutes += 24 * 60;

    }


    let normal = 0;

    let night = 0;


    for (
        let time = startMinutes;
        time < endMinutes;
        time += 30
    ) {

        let hour =
            Math.floor(
                (time % 1440) / 60
            );


        // 22:00 - 06:00

        if (
            hour >= 22 ||
            hour < 6
        ) {

            night += 0.5;

        }

        else {

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


    // =========================
    // ERIKAS GROSS
    // =========================

    let myGross = 0;


    // =========================
    // ERNESTA GROSS
    // =========================

    let gfGross = 0;


    const prefix =
        currentYear +
        "-" +
        String(
            currentMonth + 1
        ).padStart(2, "0");


    for (
        const [date, data]
        of Object.entries(schedule)
    ) {

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


            const extra =
                me.extra === true;


            myNormalHours +=
                shift.normal;


            myNightHours +=
                shift.night;


            if (extra) {

                // =========================
                // EXTRA SHIFT
                //
                // Day = 2x
                // Night = 2.5x
                // =========================

                myGross +=
                    shift.normal *
                    11.24 *
                    2;


                myGross +=
                    shift.night *
                    11.24 *
                    2.5;

            }

            else {

                // =========================
                // NORMAL SHIFT
                //
                // Day = 1x
                // Night = 1.5x
                // =========================

                myGross +=
                    shift.normal *
                    11.24;


                myGross +=
                    shift.night *
                    11.24 *
                    1.5;

            }

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

            let hours =
                calculateHours(
                    gf.start,
                    gf.end
                );


            // =========================
            // UNPAID 1 HOUR LUNCH
            // =========================

            hours =
                Math.max(
                    0,
                    hours - 1
                );


            gfHours += hours;


            const extra =
                gf.extra === true;


            if (extra) {

                // =========================
                // EXTRA DAY
                //
                // 2x
                // =========================

                gfGross +=
                    hours *
                    7.70 *
                    2;

            }

            else {

                // =========================
                // NORMAL DAY
                //
                // 1x
                // =========================

                gfGross +=
                    hours *
                    7.70;

            }

        }

    }


    // =========================
    // TOTAL HOURS
    // =========================

    const myHours =
        myNormalHours +
        myNightHours;


    // =========================
    // NET
    // =========================

    const myNet =
        calculateNet(myGross);


    const gfNet =
        calculateNet(gfGross);


    // =========================
    // DISPLAY HOURS
    // =========================

    document.getElementById(
        "myHours"
    ).textContent =
        myHours.toFixed(1) +
        "h";


    document.getElementById(
        "gfHours"
    ).textContent =
        gfHours.toFixed(1) +
        "h";


    // =========================
    // DISPLAY GROSS
    // =========================

    document.getElementById(
        "myGross"
    ).textContent =
        "€" +
        myGross.toFixed(2);


    document.getElementById(
        "gfGross"
    ).textContent =
        "€" +
        gfGross.toFixed(2);


    // =========================
    // DISPLAY NET
    // =========================

    document.getElementById(
        "myNet"
    ).textContent =
        "€" +
        myNet.toFixed(2);


    document.getElementById(
        "gfNet"
    ).textContent =
        "€" +
        gfNet.toFixed(2);
}


function calculateNet(gross) {

    const employeeSocial =
        gross * 0.195;


    let npd = 0;


    if (gross <= 2387.29) {

        npd =
            Math.max(
                0,
                747 -
                0.49 *
                (gross - 1038)
            );

    }


    const gpm =
        Math.max(
            0,
            (
                gross -
                employeeSocial -
                npd
            ) * 0.20
        );


    const net =
        gross -
        employeeSocial -
        gpm;


    return Math.max(
        0,
        net
    );
}


createTimeOptions();

loadSchedule();