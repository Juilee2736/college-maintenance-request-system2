const REQUEST_KEY = "cCollege Maintenance_requests";
const USER_KEY = "College Maintenance_user";

/* =========================================
   REQUEST STORAGE
========================================= */

function getRequests() {

    try {

        return JSON.parse(
            localStorage.getItem(REQUEST_KEY)
        ) || [];

    } catch {

        return [];

    }

}

function saveRequests(requests) {

    localStorage.setItem(
        REQUEST_KEY,
        JSON.stringify(requests)
    );

}

function getCurrentUser() {

    return localStorage.getItem(USER_KEY);

}

/* =========================================
   SECURITY / DISPLAY HELPERS
========================================= */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

function formatDate(value) {

    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}

/* =========================================
   REQUEST ID
========================================= */

function generateRequestId() {

    const requests = getRequests();

    let max = 0;

    requests.forEach(request => {

        const number = parseInt(
            String(request.id || "").replace("MR", ""),
            10
        );

        if (!isNaN(number) && number > max) {

            max = number;

        }

    });

    return "MR" +
        String(max + 1).padStart(3, "0");

}

/* =========================================
   STATUS CLASS
========================================= */

function statusClass(status) {

    if (status === "In Progress") {

        return "status-progress";

    }

    if (status === "Completed") {

        return "status-completed";

    }

    return "status-pending";

}

/* =========================================
   LOGIN
========================================= */

function selectLoginType(type) {

    const hidden =
        document.getElementById("loginType");

    if (hidden) {

        hidden.value = type;

    }

    document
        .querySelectorAll(".login-tab")
        .forEach(button => {

            button.classList.remove("active");

        });

    const buttons =
        document.querySelectorAll(".login-tab");

    if (
        type === "student" &&
        buttons[0]
    ) {

        buttons[0].classList.add("active");

    }

    if (
        type === "admin" &&
        buttons[1]
    ) {

        buttons[1].classList.add("active");

    }

}

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const type =
                document.getElementById(
                    "loginType"
                ).value;

            const id =
                document.getElementById(
                    "loginId"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const error =
                document.getElementById(
                    "loginError"
                );

            /* STUDENT */

            if (
                type === "student" &&
                id === "student" &&
                password === "1234"
            ) {

                localStorage.setItem(
                    USER_KEY,
                    "student"
                );

                window.location.href = "student-dashboard.html";

                return;

            }

            /* ADMIN */

            if (
                type === "admin" &&
                id === "admin" &&
                password === "admin123"
            ) {

                localStorage.setItem(
                    USER_KEY,
                    "admin"
                );

                window.location.href =
                    "admin-dashboard.html";

                return;

            }

            error.textContent =
                "Invalid login details. Please try again.";

        }
    );

}

/* =========================================
   PAGE ACCESS CONTROL
========================================= */

(function checkAccess() {

    const page =
        location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (
        !page ||
        page === "index.html"
    ) {

        return;

    }

    const user =
        getCurrentUser();

    const studentPages = [

        "report.html",

        "student-dashboard.html",

        "requests.html"

    ];

    const adminPages = [

        "admin-dashboard.html",

        "admin-users.html",

        "admin-evidence.html",

        "admin-tracking.html"

    ];

    if (
        studentPages.includes(page) &&
        user !== "student"
    ) {

        window.location.href =
            "index.html";

    }

    if (
        adminPages.includes(page) &&
        user !== "admin"
    ) {

        window.location.href =
            "index.html";

    }

})();

/* =========================================
   LOGOUT
========================================= */

function logout() {

    localStorage.removeItem(
        USER_KEY
    );

    window.location.href =
        "index.html";

}

/* =========================================
   PHOTO PREVIEW
========================================= */

let selectedPhotoData = "";

const photoInput =
    document.getElementById("photo");

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];

            const preview =
                document.getElementById(
                    "photoPreview"
                );

            selectedPhotoData = "";

            if (!file) {

                preview.innerHTML = "";

                return;

            }

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    selectedPhotoData =
                        event.target.result;

                    preview.innerHTML = `

                        <img
                            src="${selectedPhotoData}"
                            alt="Selected photo"
                        >

                    `;

                };

            reader.readAsDataURL(file);

        }
    );

}

/* =========================================
   NEW MAINTENANCE REQUEST
========================================= */

const requestForm =
    document.getElementById(
        "requestForm"
    );

if (requestForm) {

    requestForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const requests =
                getRequests();

            const now =
                new Date().toISOString();

            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();

            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();

            const category =
                document
                    .getElementById("category")
                    .value;

            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();

            const request = {

                id: generateRequestId(),

                user: "Student / Staff",

                issue: title,

                title: title,

                room: location,

                location: location,

                category: category,

                description: description,

                evidence:
                    selectedPhotoData || "",

                photo:
                    selectedPhotoData || "",

                status: "Pending",

                createdAt: now,

                updatedAt: now

            };

            requests.push(request);

            saveRequests(requests);

            const message =
                document.getElementById(
                    "formMessage"
                );

            message.style.color =
                "#176b55";

            message.textContent =
                `Request ${request.id} submitted successfully.`;

            setTimeout(
                function() {

                    window.location.href =
                        "student-dashboard.html";

                },
                700
            );

        }
    );

}

/* =========================================
   STUDENT TRACK REQUEST
========================================= */

function trackStudentRequest() {

    const input =
        document.getElementById(
            "trackId"
        );

    const result =
        document.getElementById(
            "trackResult"
        );

    if (
        !input ||
        !result
    ) {

        return;

    }

    const id =
        input.value
            .trim()
            .toUpperCase();

    if (!id) {

        result.innerHTML = `

            <div class="result-card">

                <p>
                    Please enter a Request ID.
                </p>

            </div>

        `;

        return;

    }

    const request =
        getRequests().find(
            request =>
                String(request.id)
                    .toUpperCase() === id
        );

    if (!request) {

        result.innerHTML = `

            <div class="result-card">

                <p>
                    Request not found.
                    Please check the Request ID.
                </p>

            </div>

        `;

        return;

    }

    result.innerHTML = `

        <div class="result-card">

            <div class="result-top">

                <div>

                    <h3>
                        ${escapeHTML(request.issue)}
                    </h3>

                    <p>
                        <strong>
                            Request ID:
                        </strong>

                        ${escapeHTML(request.id)}
                    </p>

                </div>

                <span
                    class="status-pill
                    ${statusClass(request.status)}">

                    ${escapeHTML(request.status)}

                </span>

            </div>

            <p>
                <strong>
                    Room:
                </strong>

                ${escapeHTML(request.room)}
            </p>

            <p>
                <strong>
                    Category:
                </strong>

                ${escapeHTML(request.category)}
            </p>

            <p>
                <strong>
                    Last Updated:
                </strong>

                ${formatDate(request.updatedAt)}
            </p>

        </div>

    `;

}

/* =========================================
   GUIDELINES
========================================= */

function showGuidelines() {

    alert(

        "Maintenance Guidelines\n\n" +

        "1. Report genuine maintenance issues.\n" +

        "2. Enter the correct room or location.\n" +

        "3. Clearly describe the problem.\n" +

        "4. Upload a photo when useful.\n" +

        "5. Avoid duplicate requests."

    );

    return false;

}

/* =========================================
   HELP
========================================= */

function showHelp() {

    alert(

        "Help & Support\n\n" +

        "Use New Maintenance Request " +
        "to report an issue.\n\n" +

        "Use My Requests or Track Request " +
        "to check its status."

    );

    return false;

}

/* =========================================
   MY REQUESTS
========================================= */

function renderMyRequests() {

    const list =
        document.getElementById(
            "myRequestsList"
        );

    if (!list) {

        return;

    }

    const search =
        (
            document.getElementById(
                "requestSearch"
            )?.value || ""
        ).toLowerCase();

    const filter =
        document.getElementById(
            "requestFilter"
        )?.value || "All";

    let requests =
        getRequests();

    /* FILTER */

    if (filter !== "All") {

        requests =
            requests.filter(
                request =>
                    request.status === filter
            );

    }

    /* SEARCH */

    if (search) {

        requests =
            requests.filter(
                request => [

                    request.id,

                    request.issue,

                    request.room,

                    request.category

                ].some(
                    value =>
                        String(value || "")
                            .toLowerCase()
                            .includes(search)
                )
            );

    }

    /* SORT */

    requests.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    /* EMPTY */

    if (!requests.length) {

        list.innerHTML = `

            <div class="empty-state">

                No maintenance requests found.

            </div>

        `;

        return;

    }

    /* DISPLAY */

    list.innerHTML =
        requests.map(
            request => `

            <div class="request-item">

                <div class="request-item-top">

                    <div>

                        <h3>

                            ${escapeHTML(request.id)}
                            -
                            ${escapeHTML(request.issue)}

                        </h3>

                        <p>

                            <strong>
                                Room:
                            </strong>

                            ${escapeHTML(request.room)}

                            &nbsp;

                            <strong>
                                Category:
                            </strong>

                            ${escapeHTML(request.category)}

                        </p>

                    </div>

                    <span
                        class="status-pill
                        ${statusClass(request.status)}">

                        ${escapeHTML(request.status)}

                    </span>

                </div>

                <p>
                    ${escapeHTML(request.description)}
                </p>

                <p>

                    <strong>
                        Last Updated:
                    </strong>

                    ${formatDate(request.updatedAt)}

                </p>

                ${
                    request.photo

                    ?

                    `
                    <img
                        class="request-photo"
                        src="${request.photo}"
                        alt="Request evidence"
                    >
                    `

                    :

                    ""
                }

            </div>

        `
        ).join("");

}

if (
    document.getElementById(
        "myRequestsList"
    )
) {

    renderMyRequests();

}

/* =========================================
   ADMIN STATISTICS
========================================= */

function updateAdminStats() {

    const requests =
        getRequests();

    const set =
        function(id, value) {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value;

            }

        };

    set(
        "adminTotal",
        requests.length
    );

    set(
        "adminPending",
        requests.filter(
            request =>
                request.status 

           /* =========================================
   LOGOUT
========================================= */

function logout() {

    // Remove logged-in user
    localStorage.removeItem("College Maintenance_user");

    // Go back to login page
    window.location.href = "index.html";
} 
/* =========================================
   LOGOUT
========================================= */

function logout() {

    localStorage.clear();

    window.location.replace("index.html");

}