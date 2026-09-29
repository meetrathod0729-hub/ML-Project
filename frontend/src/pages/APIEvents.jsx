import { useEffect, useMemo, useState } from "react";

function APIEvents({ searchQuery = "" }) {
    const [events, setEvents] = useState([]);

    // Global statistics from backend
    const [stats, setStats] = useState({
        total: 0,
        normal: 0,
        anomalies: 0,
        anomalyRate: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");


    // =========================================================
    // FETCH API EVENTS + GLOBAL STATISTICS
    // =========================================================

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/events"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch API events"
                );
            }

            const data = await response.json();


            // -------------------------------------------------
            // Latest events for table
            // -------------------------------------------------

            if (
                data.success &&
                Array.isArray(data.events)
            ) {
                setEvents(data.events);
            } else {
                setEvents([]);
            }


            // -------------------------------------------------
            // Global statistics
            // -------------------------------------------------

            if (
                data.success &&
                data.stats
            ) {
                setStats({
                    total: data.stats.total ?? 0,
                    normal: data.stats.normal ?? 0,
                    anomalies: data.stats.anomalies ?? 0,
                    anomalyRate:
                        data.stats.anomalyRate ?? 0,
                });
            }

        } catch (err) {

            console.error(
                "API Events Error:",
                err
            );

            setError(
                "Unable to load API events."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL FETCH + AUTO REFRESH
    // =========================================================

    useEffect(() => {
        fetchEvents();

        // Refresh every 10 seconds
        const interval = setInterval(
            fetchEvents,
            10000
        );

        return () => clearInterval(interval);
    }, []);


    // =========================================================
    // SEARCH + FILTER
    // =========================================================

    const filteredEvents = useMemo(() => {

        const query =
            (searchQuery || search)
                .toLowerCase()
                .trim();


        return events

            // -------------------------------------------------
            // Filter by prediction
            // -------------------------------------------------

            .filter((event) => {

                if (filter === "ANOMALY") {

                    return (
                        event.prediction
                            ?.toLowerCase() ===
                        "anomaly"
                    );
                }


                if (filter === "NORMAL") {

                    return (
                        event.prediction
                            ?.toLowerCase() ===
                        "normal"
                    );
                }


                return true;
            })


            // -------------------------------------------------
            // Search
            // -------------------------------------------------

            .filter((event) => {

                if (!query) return true;


                return (
                    event.method
                        ?.toLowerCase()
                        .includes(query) ||

                    event.requestUrl
                        ?.toLowerCase()
                        .includes(query) ||

                    event.sourceIp
                        ?.toLowerCase()
                        .includes(query) ||

                    event.targetIp
                        ?.toLowerCase()
                        .includes(query) ||

                    event.prediction
                        ?.toLowerCase()
                        .includes(query) ||

                    event.userIdentity
                        ?.toLowerCase()
                        .includes(query)
                );
            })


            // -------------------------------------------------
            // Newest first
            // -------------------------------------------------

            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

    }, [
        events,
        search,
        searchQuery,
        filter,
    ]);


    // =========================================================
    // DATE FORMATTING
    // =========================================================

    const formatDate = (date) => {

        if (!date) return "—";


        const parsed = new Date(date);


        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }


        return parsed.toLocaleString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    // =========================================================
    // SCORE FORMATTING
    // =========================================================

    const formatScore = (score) => {

        if (typeof score !== "number") {
            return "—";
        }


        return score.toFixed(3);
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="dashboard">


            {/* =================================================
                PAGE HEADING
            ================================================= */}

            <div className="page-heading">

                <div>

                    <span className="page-eyebrow">
                        MONITORING
                    </span>


                    <h2>
                        API Events
                    </h2>


                    <p>
                        Monitor and inspect API requests analyzed
                        by the ML detection engine.
                    </p>

                </div>


                <button
                    onClick={fetchEvents}
                    style={{
                        padding: "11px 18px",
                        borderRadius: "9px",
                        border:
                            "1px solid rgba(70, 145, 255, 0.35)",
                        background:
                            "rgba(40, 110, 220, 0.08)",
                        color: "#65aaff",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                    }}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    style={{
                        marginBottom: "20px",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        border:
                            "1px solid rgba(255, 80, 100, 0.35)",
                        background:
                            "rgba(255, 70, 90, 0.08)",
                        color: "#ff7185",
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>

            )}


            {/* =================================================
                EVENT STATISTICS
            ================================================= */}

            <section
                className="stats-grid"
                style={{
                    marginBottom: "24px",
                }}
            >


                {/* TOTAL EVENTS */}

                <div className="stat-card">

                    <span className="stat-title">
                        TOTAL EVENTS
                    </span>


                    <strong>
                        {loading
                            ? "..."
                            : stats.total.toLocaleString()}
                    </strong>


                    <span className="stat-subtitle">
                        API requests analyzed
                    </span>

                </div>


                {/* NORMAL EVENTS */}

                <div className="stat-card">

                    <span className="stat-title">
                        NORMAL EVENTS
                    </span>


                    <strong>
                        {loading
                            ? "..."
                            : stats.normal.toLocaleString()}
                    </strong>


                    <span className="stat-subtitle">
                        Normal API requests
                    </span>

                </div>


                {/* ANOMALIES */}

                <div className="stat-card anomaly-stat">

                    <span className="stat-title">
                        ANOMALIES
                    </span>


                    <strong>
                        {loading
                            ? "..."
                            : stats.anomalies.toLocaleString()}
                    </strong>


                    <span className="stat-subtitle">
                        ML flagged requests
                    </span>

                </div>


                {/* DETECTION ENGINE */}

                <div className="stat-card">

                    <span className="stat-title">
                        DETECTION ENGINE
                    </span>


                    <strong
                        style={{
                            fontSize: "20px",
                            color: "#45d483",
                        }}
                    >
                        ONLINE
                    </strong>


                    <span className="stat-subtitle">
                        ML service connected
                    </span>

                </div>

            </section>


            {/* =================================================
                EVENTS PANEL
            ================================================= */}

            <section className="dashboard-panel">


                {/* Header */}

                <div className="panel-heading">

                    <div>

                        <h3>
                            API Request Events
                        </h3>


                        <p>
                            Complete API traffic analyzed by API
                            Sentinel
                        </p>

                    </div>

                </div>


                {/* =================================================
                    CONTROLS
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                        padding: "20px",
                        borderBottom:
                            "1px solid rgba(80, 110, 160, 0.15)",
                        flexWrap: "wrap",
                    }}
                >


                    {/* Search */}

                    <div
                        style={{
                            flex: "1",
                            minWidth: "250px",
                            position: "relative",
                        }}
                    >

                        <input
                            type="text"
                            placeholder="Search endpoint, IP, method..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "12px 16px",
                                borderRadius: "9px",
                                border:
                                    "1px solid rgba(90, 130, 190, 0.25)",
                                background:
                                    "rgba(20, 35, 60, 0.45)",
                                color: "#dce9ff",
                                outline: "none",
                                fontSize: "14px",
                            }}
                        />

                    </div>


                    {/* Filter */}

                    <select
                        value={filter}
                        onChange={(e) =>
                            setFilter(e.target.value)
                        }
                        style={{
                            padding: "12px 16px",
                            borderRadius: "9px",
                            border:
                                "1px solid rgba(90, 130, 190, 0.25)",
                            background:
                                "#0c1525",
                            color: "#a9bddb",
                            outline: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >

                        <option value="ALL">
                            All Events
                        </option>


                        <option value="ANOMALY">
                            Anomalies
                        </option>


                        <option value="NORMAL">
                            Normal
                        </option>

                    </select>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div
                    style={{
                        overflowX: "auto",
                    }}
                >

                    {loading ? (

                        <div
                            style={{
                                minHeight: "250px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6480a8",
                                fontSize: "15px",
                            }}
                        >
                            Loading API events...
                        </div>

                    ) : filteredEvents.length === 0 ? (

                        <div
                            style={{
                                minHeight: "250px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6480a8",
                                gap: "8px",
                            }}
                        >

                            <span
                                style={{
                                    fontSize: "16px",
                                }}
                            >
                                No events found
                            </span>


                            <span
                                style={{
                                    fontSize: "13px",
                                }}
                            >
                                Try changing your search or filter.
                            </span>

                        </div>

                    ) : (

                        <table
                            style={{
                                width: "100%",
                                minWidth: "1050px",
                                borderCollapse:
                                    "collapse",
                                fontSize: "14px",
                            }}
                        >

                            <thead>

                                <tr>

                                    <th className="events-th">
                                        METHOD
                                    </th>


                                    <th className="events-th">
                                        ENDPOINT
                                    </th>


                                    <th className="events-th">
                                        SOURCE IP
                                    </th>


                                    <th className="events-th">
                                        STATUS
                                    </th>


                                    <th className="events-th">
                                        RESPONSE
                                    </th>


                                    <th className="events-th">
                                        ML RESULT
                                    </th>


                                    <th className="events-th">
                                        SCORE
                                    </th>


                                    <th className="events-th">
                                        TIME
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredEvents.map(
                                    (event, index) => {

                                        const isAnomaly =
                                            event.prediction
                                                ?.toLowerCase() ===
                                            "anomaly";


                                        return (

                                            <tr
                                                key={
                                                    event._id ||
                                                    index
                                                }
                                                style={{
                                                    background:
                                                        isAnomaly
                                                            ? "rgba(255, 70, 90, 0.025)"
                                                            : "transparent",
                                                }}
                                            >


                                                {/* METHOD */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            padding:
                                                                "5px 9px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "rgba(70, 160, 255, 0.10)",
                                                            color:
                                                                "#63b1ff",
                                                            fontWeight:
                                                                "700",
                                                            fontSize:
                                                                "12px",
                                                        }}
                                                    >
                                                        {event.method ||
                                                            "—"}
                                                    </span>

                                                </td>


                                                {/* ENDPOINT */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            color:
                                                                "#d2def0",
                                                            fontWeight:
                                                                "500",
                                                        }}
                                                    >
                                                        {event.requestUrl ||
                                                            "—"}
                                                    </span>

                                                </td>


                                                {/* SOURCE IP */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            color:
                                                                "#8fa7cb",
                                                        }}
                                                    >
                                                        {event.sourceIp ||
                                                            "—"}
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            color:
                                                                event.status >=
                                                                400
                                                                    ? "#ff7185"
                                                                    : "#55d99a",
                                                            fontWeight:
                                                                "600",
                                                        }}
                                                    >
                                                        {event.status ??
                                                            "—"}
                                                    </span>

                                                </td>


                                                {/* RESPONSE TIME */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            color:
                                                                "#91a9ca",
                                                        }}
                                                    >
                                                        {event.responseTime ??
                                                            0}
                                                        ms
                                                    </span>

                                                </td>


                                                {/* ML RESULT */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "6px",
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "20px",
                                                            background:
                                                                isAnomaly
                                                                    ? "rgba(255, 70, 90, 0.10)"
                                                                    : "rgba(60, 210, 140, 0.10)",
                                                            border:
                                                                isAnomaly
                                                                    ? "1px solid rgba(255, 70, 90, 0.25)"
                                                                    : "1px solid rgba(60, 210, 140, 0.25)",
                                                            color:
                                                                isAnomaly
                                                                    ? "#ff7185"
                                                                    : "#55d99a",
                                                            fontSize:
                                                                "11px",
                                                            fontWeight:
                                                                "700",
                                                        }}
                                                    >

                                                        <span
                                                            style={{
                                                                width:
                                                                    "6px",
                                                                height:
                                                                    "6px",
                                                                borderRadius:
                                                                    "50%",
                                                                background:
                                                                    "currentColor",
                                                            }}
                                                        >
                                                        </span>


                                                        {isAnomaly
                                                            ? "ANOMALY"
                                                            : "NORMAL"}

                                                    </span>

                                                </td>


                                                {/* SCORE */}

                                                <td className="events-td">

                                                    <span
                                                        style={{
                                                            color:
                                                                isAnomaly
                                                                    ? "#ff7185"
                                                                    : "#8fa7cb",
                                                            fontWeight:
                                                                isAnomaly
                                                                    ? "600"
                                                                    : "500",
                                                        }}
                                                    >
                                                        {formatScore(
                                                            event.anomalyScore
                                                        )}
                                                    </span>

                                                </td>


                                                {/* TIME */}

                                                <td
                                                    className="events-td"
                                                    style={{
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            color:
                                                                "#7188ad",
                                                            fontSize:
                                                                "13px",
                                                        }}
                                                    >
                                                        {formatDate(
                                                            event.createdAt
                                                        )}
                                                    </span>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        padding:
                            "14px 20px",
                        borderTop:
                            "1px solid rgba(80, 110, 160, 0.12)",
                        color:
                            "#647da3",
                        fontSize: "13px",
                    }}
                >

                    Showing{" "}

                    <strong
                        style={{
                            color: "#9bb2d4",
                        }}
                    >
                        {filteredEvents.length}
                    </strong>{" "}

                    of{" "}

                    <strong
                        style={{
                            color: "#9bb2d4",
                        }}
                    >
                        {events.length}
                    </strong>{" "}

                    latest events

                    <span
                        style={{
                            marginLeft: "6px",
                        }}
                    >
                        ·{" "}
                        {stats.total.toLocaleString()}
                        {" "}
                        total events
                    </span>

                </div>

            </section>

        </main>
    );
}

export default APIEvents;