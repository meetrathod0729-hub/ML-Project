import API_URL from "../config";
import { useEffect, useMemo, useState } from "react";

function Anomalies() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);

    // =========================================================
    // FETCH ANOMALIES
    // =========================================================

    const fetchAnomalies = async (manualRefresh = false) => {
        try {
            setError("");

            if (manualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await fetch(
                `${API_URL}/api/events`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch anomaly data"
                );
            }

            const data = await response.json();

            if (data.success) {
                const anomalies = (data.events || []).filter(
                    (event) =>
                        event.prediction?.toLowerCase() ===
                        "anomaly"
                );

                setEvents(anomalies);
            } else {
                throw new Error(
                    data.message ||
                        "Failed to fetch anomalies"
                );
            }
        } catch (err) {
            console.error(
                "Anomalies Error:",
                err
            );

            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // =========================================================
    // INITIAL LOAD + AUTO REFRESH
    // =========================================================

    useEffect(() => {
        fetchAnomalies();

        const interval = setInterval(() => {
            fetchAnomalies();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredEvents = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return events;
        }

        return events.filter((event) =>
            [
                event.method,
                event.requestUrl,
                event.sourceIp,
                event.targetIp,
                event.status,
                event.userIdentity,
                event.prediction,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(query)
                )
        );
    }, [events, search]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const statistics = useMemo(() => {
        const total = events.length;

        const scores = events
            .map((event) =>
                Number(event.anomalyScore)
            )
            .filter(
                (score) => !Number.isNaN(score)
            );

        const thresholds = events
            .map((event) =>
                Number(event.threshold)
            )
            .filter(
                (threshold) =>
                    !Number.isNaN(threshold)
            );

        const highestScore =
            scores.length > 0
                ? Math.max(...scores).toFixed(3)
                : "0.000";

        const averageScore =
            scores.length > 0
                ? (
                      scores.reduce(
                          (sum, score) =>
                              sum + score,
                          0
                      ) / scores.length
                  ).toFixed(3)
                : "0.000";

        const threshold =
            thresholds.length > 0
                ? (
                      thresholds.reduce(
                          (sum, value) =>
                              sum + value,
                          0
                      ) / thresholds.length
                  ).toFixed(3)
                : "â€”";

        return {
            total,
            highestScore,
            averageScore,
            threshold,
        };
    }, [events]);

    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {
        if (!date) return "â€”";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "â€”";
        }

        return parsed.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main className="dashboard">
                <div className="loading-state">
                    Loading anomalies...
                </div>
            </main>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error && events.length === 0) {
        return (
            <main className="dashboard">
                <div className="error-state">
                    <h3>
                        Unable to load anomalies
                    </h3>

                    <p>{error}</p>

                    <button
                        className="refresh-button"
                        onClick={() =>
                            fetchAnomalies(true)
                        }
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

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
                        SECURITY OPERATIONS
                    </span>

                    <h2>
                        Anomaly Detection
                    </h2>

                    <p>
                        Investigate API requests flagged
                        as anomalous by the ML detection
                        engine.
                    </p>
                </div>

                <div className="dashboard-status anomaly-status">
                    <span></span>
                    Detection Active
                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div
                    style={{
                        marginBottom: "20px",
                        padding: "12px 16px",
                        border:
                            "1px solid rgba(255, 90, 100, 0.35)",
                        borderRadius: "10px",
                        color: "#ff7180",
                        background:
                            "rgba(255, 70, 80, 0.08)",
                    }}
                >
                    {error}
                </div>
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="stats-grid">

                <div className="stat-card anomaly-stat">

                    <span className="stat-title">
                        TOTAL ANOMALIES
                    </span>

                    <strong>
                        {statistics.total}
                    </strong>

                    <span className="stat-subtitle">
                        Suspicious requests detected
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-title">
                        HIGHEST SCORE
                    </span>

                    <strong>
                        {statistics.highestScore}
                    </strong>

                    <span className="stat-subtitle">
                        Maximum anomaly score
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-title">
                        AVG SCORE
                    </span>

                    <strong>
                        {statistics.averageScore}
                    </strong>

                    <span className="stat-subtitle">
                        Average anomaly score
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-title">
                        DETECTION THRESHOLD
                    </span>

                    <strong>
                        {statistics.threshold}
                    </strong>

                    <span className="stat-subtitle">
                        ML decision threshold
                    </span>

                </div>

            </section>


            {/* =================================================
                DETECTED ANOMALIES
            ================================================= */}

            <section className="dashboard-panel anomaly-panel">

                <div className="panel-heading">

                    <div>
                        <h3>
                            Detected Anomalies
                        </h3>

                        <p>
                            Requests identified as
                            suspicious by the autoencoder.
                        </p>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={() =>
                            fetchAnomalies(true)
                        }
                        disabled={refreshing}
                        style={{
                            opacity: refreshing
                                ? 0.6
                                : 1,
                            cursor: refreshing
                                ? "not-allowed"
                                : "pointer",
                        }}
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="anomaly-search-wrapper">

                    <input
                        type="text"
                        className="anomaly-search"
                        placeholder="Search endpoint, IP, method, status..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    <span className="anomaly-count">
                        {filteredEvents.length} result
                        {filteredEvents.length !== 1
                            ? "s"
                            : ""}
                    </span>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="events-table-wrapper">

                    <table className="events-table">

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
                                    SCORE
                                </th>

                                <th className="events-th">
                                    THRESHOLD
                                </th>

                                <th className="events-th">
                                    TIME
                                </th>

                                <th className="events-th">
                                    ACTION
                                </th>

                            </tr>
                        </thead>


                        <tbody>

                            {filteredEvents.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="events-empty"
                                    >
                                        <div>

                                            <strong>
                                                No anomalies found
                                            </strong>

                                            <span>
                                                No suspicious
                                                requests match
                                                your search.
                                            </span>

                                        </div>
                                    </td>

                                </tr>

                            ) : (

                                filteredEvents.map(
                                    (event) => (

                                        <tr
                                            key={
                                                event._id
                                            }
                                        >

                                            <td className="events-td">

                                                <span className="method-badge">
                                                    {event.method}
                                                </span>

                                            </td>


                                            <td className="events-td">

                                                <span className="endpoint-text">
                                                    {event.requestUrl}
                                                </span>

                                            </td>


                                            <td className="events-td">

                                                <span className="ip-text">
                                                    {event.sourceIp ||
                                                        "â€”"}
                                                </span>

                                            </td>


                                            <td className="events-td">

                                                <span className="status-badge">
                                                    {event.status}
                                                </span>

                                            </td>


                                            <td className="events-td">

                                                {event.responseTime ??
                                                    0}
                                                ms

                                            </td>


                                            <td className="events-td">

                                                <span className="score-badge">

                                                    {Number(
                                                        event.anomalyScore
                                                    ).toFixed(3)}

                                                </span>

                                            </td>


                                            <td className="events-td">

                                                {Number(
                                                    event.threshold
                                                ).toFixed(3)}

                                            </td>


                                            <td className="events-td">

                                                <span className="time-text">

                                                    {formatDate(
                                                        event.createdAt
                                                    )}

                                                </span>

                                            </td>


                                            <td className="events-td">

                                                <button
                                                    className="inspect-button"
                                                    onClick={() =>
                                                        setSelectedEvent(
                                                            event
                                                        )
                                                    }
                                                >
                                                    Inspect
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                INSPECT MODAL
            ================================================= */}

            {selectedEvent && (

                <div
                    onClick={() =>
                        setSelectedEvent(null)
                    }
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(2, 6, 18, 0.78)",
                        backdropFilter:
                            "blur(5px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "30px",
                        zIndex: 1000,
                    }}
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        style={{
                            width: "min(900px, 100%)",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            background:
                                "#0b1224",
                            border:
                                "1px solid rgba(70, 145, 255, 0.35)",
                            borderRadius: "16px",
                            boxShadow:
                                "0 25px 80px rgba(0, 0, 0, 0.55)",
                        }}
                    >

                        {/* MODAL HEADER */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "flex-start",
                                padding:
                                    "24px 26px",
                                borderBottom:
                                    "1px solid rgba(80, 110, 160, 0.15)",
                            }}
                        >

                            <div>

                                <span className="page-eyebrow">
                                    EVENT INSPECTION
                                </span>

                                <h3
                                    style={{
                                        margin:
                                            "6px 0 5px",
                                        fontSize:
                                            "22px",
                                    }}
                                >
                                    Anomaly Details
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color:
                                            "#7188ad",
                                        fontSize:
                                            "14px",
                                    }}
                                >
                                    Detailed information
                                    about the selected
                                    suspicious request.
                                </p>

                            </div>


                            <button
                                className="refresh-button"
                                onClick={() =>
                                    setSelectedEvent(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>


                        {/* MODAL CONTENT */}

                        <div
                            className="anomaly-details-grid"
                            style={{
                                padding: "26px",
                            }}
                        >

                            <div className="detail-item">
                                <span>EVENT ID</span>
                                <strong>
                                    {selectedEvent._id}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>METHOD</span>
                                <strong>
                                    {selectedEvent.method}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>ENDPOINT</span>
                                <strong>
                                    {selectedEvent.requestUrl}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>SOURCE IP</span>
                                <strong>
                                    {selectedEvent.sourceIp ||
                                        "â€”"}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>SOURCE PORT</span>
                                <strong>
                                    {selectedEvent.sourcePort ||
                                        "â€”"}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>TARGET IP</span>
                                <strong>
                                    {selectedEvent.targetIp ||
                                        "â€”"}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>TARGET PORT</span>
                                <strong>
                                    {selectedEvent.targetPort ||
                                        "â€”"}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>STATUS</span>
                                <strong>
                                    {selectedEvent.status}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>RESPONSE TIME</span>
                                <strong>
                                    {
                                        selectedEvent.responseTime
                                    }{" "}
                                    ms
                                </strong>
                            </div>


                            <div className="detail-item score-detail">
                                <span>
                                    ANOMALY SCORE
                                </span>

                                <strong>
                                    {Number(
                                        selectedEvent.anomalyScore
                                    ).toFixed(4)}
                                </strong>
                            </div>


                            <div className="detail-item threshold-detail">
                                <span>
                                    THRESHOLD
                                </span>

                                <strong>
                                    {Number(
                                        selectedEvent.threshold
                                    ).toFixed(4)}
                                </strong>
                            </div>


                            <div className="detail-item">
                                <span>
                                    PREDICTION
                                </span>

                                <strong className="anomaly-text">
                                    {
                                        selectedEvent.prediction
                                    }
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}

export default Anomalies;
