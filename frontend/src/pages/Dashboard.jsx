import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [stats, setStats] = useState({
        totalRequests: 0,
        normalRequests: 0,
        anomalies: 0,
        anomalyRate: 0,
    });

    const [timeline, setTimeline] = useState([]);
    const [methodDistribution, setMethodDistribution] = useState([]);
    const [suspiciousEvents, setSuspiciousEvents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    useEffect(() => {
        if (!token) return;

        const fetchDashboardData = async () => {
            try {
                setError("");

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [
                    statsResponse,
                    timelineResponse,
                    methodResponse,
                    anomaliesResponse,
                ] = await Promise.all([
                    fetch("http://localhost:5000/api/dashboard/stats", {
                        headers,
                    }),

                    fetch("http://localhost:5000/api/dashboard/timeline", {
                        headers,
                    }),

                    fetch("http://localhost:5000/api/dashboard/method", {
                        headers,
                    }),

                    fetch(
                        "http://localhost:5000/api/dashboard/recent-anomalies",
                        {
                            headers,
                        }
                    ),
                ]);

                if (
                    !statsResponse.ok ||
                    !timelineResponse.ok ||
                    !methodResponse.ok ||
                    !anomaliesResponse.ok
                ) {
                    throw new Error(
                        "Failed to fetch dashboard data"
                    );
                }

                const statsData = await statsResponse.json();
                const timelineData = await timelineResponse.json();
                const methodData = await methodResponse.json();
                const anomaliesData =
                    await anomaliesResponse.json();

                // Statistics
                if (statsData.success) {
                    setStats(statsData.stats);
                }

                // Timeline
                if (timelineData.success) {
                    setTimeline(timelineData.timeline || []);
                }

                // HTTP methods
                if (methodData.success) {
                    setMethodDistribution(
                        methodData.methods || []
                    );
                }

                // Recent anomalies
                if (anomaliesData.success) {
                    setSuspiciousEvents(
                        anomaliesData.anomalies || []
                    );
                }
            } catch (err) {
                console.error(
                    "Dashboard fetch error:",
                    err
                );

                setError(
                    "Unable to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Refresh every 10 seconds
        const interval = setInterval(
            fetchDashboardData,
            10000
        );

        return () => clearInterval(interval);
    }, [token]);

    // =========================================================
    // PREPARE TIMELINE DATA
    // =========================================================

    const trafficData = useMemo(() => {
        const hours = [];

        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const hourDate = new Date(now);

            hourDate.setMinutes(0, 0, 0);
            hourDate.setHours(
                hourDate.getHours() - i
            );

            hours.push({
                date: hourDate,
                label: hourDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                total: 0,
                anomalies: 0,
            });
        }

        timeline.forEach((item) => {
            if (!item._id) return;

            const {
                year,
                month,
                day,
                hour,
            } = item._id;

            const timelineDate = new Date(
                year,
                month - 1,
                day,
                hour
            );

            const matchingHour = hours.find(
                (entry) =>
                    entry.date.getFullYear() ===
                        timelineDate.getFullYear() &&
                    entry.date.getMonth() ===
                        timelineDate.getMonth() &&
                    entry.date.getDate() ===
                        timelineDate.getDate() &&
                    entry.date.getHours() ===
                        timelineDate.getHours()
            );

            if (matchingHour) {
                matchingHour.total =
                    item.totalRequests || 0;

                matchingHour.anomalies =
                    item.anomalies || 0;
            }
        });

        return hours;
    }, [timeline]);

    // =========================================================
    // CHART POINTS
    // =========================================================

    const chartPoints = useMemo(() => {
        const width = 900;
        const height = 300;
        const padding = 35;

        const maxValue = Math.max(
            ...trafficData.map(
                (item) => item.total
            ),
            1
        );

        const getX = (index) =>
            padding +
            (index /
                Math.max(
                    trafficData.length - 1,
                    1
                )) *
                (width - padding * 2);

        const getY = (value) =>
            height -
            padding -
            (value / maxValue) *
                (height - padding * 2);

        const totalPoints = trafficData.map(
            (item, index) => ({
                x: getX(index),
                y: getY(item.total),
            })
        );

        const anomalyPoints = trafficData.map(
            (item, index) => ({
                x: getX(index),
                y: getY(item.anomalies),
            })
        );

        return {
            totalPoints,
            anomalyPoints,
            width,
            height,
            padding,
        };
    }, [trafficData]);

    // =========================================================
    // SVG PATHS
    // =========================================================

    const totalPath = chartPoints.totalPoints
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ");

    const anomalyPath = chartPoints.anomalyPoints
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ");

    // =========================================================
    // METHOD DISTRIBUTION
    // =========================================================

    const maxMethodCount = Math.max(
        ...methodDistribution.map(
            (item) => item.count
        ),
        1
    );

    // =========================================================
    // DATE FORMAT
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
            hour: "2-digit",
            minute: "2-digit",
        });
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
                        SECURITY OPERATIONS
                    </span>

                    <h2>
                        API Security Overview
                    </h2>

                    <p>
                        Monitor API traffic and detect
                        anomalous behavior using machine
                        learning.
                    </p>

                </div>

                <div className="dashboard-status">
                    <span></span>
                    Monitoring Active
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

                <div className="stat-card">

                    <span className="stat-title">
                        TOTAL REQUESTS
                    </span>

                    <strong>
                        {loading
                            ? "..."
                            : stats.totalRequests}
                    </strong>

                    <span className="stat-subtitle">
                        Analyzed requests
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-title">
                        NORMAL TRAFFIC
                    </span>

                    <strong>
                        {loading
                            ? "..."
                            : stats.normalRequests}
                    </strong>

                    <span className="stat-subtitle">
                        Normal requests
                    </span>

                </div>


                <div className="stat-card anomaly-stat">

                    <span className="stat-title">
                        ANOMALIES
                    </span>

                    <strong>
                        {loading
                            ? "..."
                            : stats.anomalies}
                    </strong>

                    <span className="stat-subtitle">
                        Suspicious requests
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-title">
                        ANOMALY RATE
                    </span>

                    <strong>
                        {loading
                            ? "..."
                            : `${stats.anomalyRate}%`}
                    </strong>

                    <span className="stat-subtitle">
                        Percentage of traffic
                    </span>

                </div>

            </section>


            {/* =================================================
                MAIN DASHBOARD GRID
            ================================================= */}

            <section className="dashboard-grid">


                {/* =================================================
                    API TRAFFIC
                ================================================= */}

                <div className="dashboard-panel traffic-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                API Traffic
                            </h3>

                            <p>
                                Request activity and anomalies
                            </p>

                        </div>

                        <div className="panel-filter">
                            Last 24 hours
                        </div>

                    </div>


                    <div
                        style={{
                            padding: "20px",
                            height: "330px",
                        }}
                    >

                        {loading ? (

                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#6480a8",
                                    fontSize: "15px",
                                }}
                            >
                                Loading traffic data...
                            </div>

                        ) : timeline.length === 0 ? (

                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#6480a8",
                                    fontSize: "15px",
                                }}
                            >
                                No traffic data available
                            </div>

                        ) : (

                            <svg
                                viewBox="0 0 900 300"
                                width="100%"
                                height="100%"
                                preserveAspectRatio="none"
                            >

                                {/* Grid lines */}

                                {[0, 1, 2, 3, 4].map(
                                    (line) => {

                                        const y =
                                            chartPoints.padding +
                                            (line / 4) *
                                                (
                                                    chartPoints.height -
                                                    chartPoints.padding *
                                                        2
                                                );

                                        return (
                                            <line
                                                key={line}
                                                x1={
                                                    chartPoints.padding
                                                }
                                                y1={y}
                                                x2={
                                                    chartPoints.width -
                                                    chartPoints.padding
                                                }
                                                y2={y}
                                                stroke="rgba(100, 140, 200, 0.12)"
                                                strokeWidth="1"
                                            />
                                        );
                                    }
                                )}


                                {/* Total traffic */}

                                <path
                                    d={totalPath}
                                    fill="none"
                                    stroke="#4da3ff"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />


                                {/* Anomaly traffic */}

                                <path
                                    d={anomalyPath}
                                    fill="none"
                                    stroke="#ff5f79"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />


                                {/* Total traffic points */}

                                {chartPoints.totalPoints.map(
                                    (point, index) => (

                                        <circle
                                            key={`total-${index}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill="#4da3ff"
                                        />

                                    )
                                )}


                                {/* Anomaly points */}

                                {chartPoints.anomalyPoints.map(
                                    (point, index) => (

                                        <circle
                                            key={`anomaly-${index}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill="#ff5f79"
                                        />

                                    )
                                )}

                            </svg>

                        )}

                    </div>


                    {/* Chart legend */}

                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            padding:
                                "0 24px 18px",
                            fontSize: "13px",
                            color: "#7890b5",
                        }}
                    >

                        <span
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "7px",
                            }}
                        >

                            <span
                                style={{
                                    width: "9px",
                                    height: "9px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#4da3ff",
                                }}
                            />

                            Total requests

                        </span>


                        <span
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "7px",
                            }}
                        >

                            <span
                                style={{
                                    width: "9px",
                                    height: "9px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#ff5f79",
                                }}
                            />

                            Anomalies

                        </span>

                    </div>

                </div>


                {/* =================================================
                    HTTP METHODS
                ================================================= */}

                <div className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                HTTP Methods
                            </h3>

                            <p>
                                Request distribution
                            </p>

                        </div>

                    </div>


                    <div
                        style={{
                            padding:
                                "28px 24px",
                            minHeight:
                                "330px",
                        }}
                    >

                        {methodDistribution.length ===
                        0 ? (

                            <div
                                style={{
                                    height: "280px",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    color:
                                        "#6480a8",
                                    fontSize:
                                        "15px",
                                }}
                            >
                                No method data available
                            </div>

                        ) : (

                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap: "22px",
                                }}
                            >

                                {methodDistribution
                                    .slice(0, 6)
                                    .map(
                                        (
                                            item
                                        ) => {

                                            const method =
                                                item._id ||
                                                "UNKNOWN";

                                            const count =
                                                item.count ||
                                                0;

                                            const percentage =
                                                stats.totalRequests >
                                                0
                                                    ? (
                                                          count /
                                                          stats.totalRequests
                                                      ) *
                                                      100
                                                    : 0;

                                            const barWidth =
                                                (count /
                                                    maxMethodCount) *
                                                100;

                                            return (
                                                <div
                                                    key={
                                                        method
                                                    }
                                                >

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            marginBottom:
                                                                "8px",
                                                            fontSize:
                                                                "14px",
                                                        }}
                                                    >

                                                        <span
                                                            style={{
                                                                color:
                                                                    "#a9bddb",
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        >
                                                            {
                                                                method
                                                            }
                                                        </span>

                                                        <span
                                                            style={{
                                                                color:
                                                                    "#7188ad",
                                                            }}
                                                        >
                                                            {
                                                                count
                                                            }{" "}
                                                            (
                                                            {percentage.toFixed(
                                                                1
                                                            )}
                                                            %)
                                                        </span>

                                                    </div>


                                                    <div
                                                        style={{
                                                            height:
                                                                "9px",
                                                            background:
                                                                "rgba(80, 110, 160, 0.15)",
                                                            borderRadius:
                                                                "20px",
                                                            overflow:
                                                                "hidden",
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                width: `${barWidth}%`,
                                                                height:
                                                                    "100%",
                                                                borderRadius:
                                                                    "20px",
                                                                background:
                                                                    "linear-gradient(90deg, #3d8cff, #53d8ff)",
                                                                boxShadow:
                                                                    "0 0 12px rgba(60, 150, 255, 0.35)",
                                                                transition:
                                                                    "width 0.4s ease",
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* =================================================
                RECENT SUSPICIOUS ACTIVITY
            ================================================= */}

            <section className="dashboard-panel activity-panel">

                <div className="panel-heading">

                    <div>

                        <h3>
                            Recent Suspicious Activity
                        </h3>

                        <p>
                            API requests flagged by the ML
                            detection engine
                        </p>

                    </div>

                    <button className="view-all-button" onClick={() => navigate("/events")}>
                        View all
                    </button>

                </div>


                <div
                    style={{
                        overflowX: "auto",
                    }}
                >

                    {loading ? (

                        <div
                            style={{
                                minHeight: "180px",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                color: "#6480a8",
                                fontSize: "15px",
                            }}
                        >
                            Loading suspicious activity...
                        </div>

                    ) : suspiciousEvents.length ===
                      0 ? (

                        <div
                            style={{
                                minHeight: "180px",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                color: "#6480a8",
                                fontSize: "15px",
                            }}
                        >
                            No suspicious activity detected
                        </div>

                    ) : (

                        <table
                            style={{
                                width: "100%",
                                borderCollapse:
                                    "collapse",
                                fontSize: "14px",
                            }}
                        >

                            <thead>

                                <tr>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "16px 20px",
                                            color:
                                                "#7188ad",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "1px",
                                            borderBottom:
                                                "1px solid rgba(80, 110, 160, 0.15)",
                                        }}
                                    >
                                        METHOD
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "16px 20px",
                                            color:
                                                "#7188ad",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "1px",
                                            borderBottom:
                                                "1px solid rgba(80, 110, 160, 0.15)",
                                        }}
                                    >
                                        ENDPOINT
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "16px 20px",
                                            color:
                                                "#7188ad",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "1px",
                                            borderBottom:
                                                "1px solid rgba(80, 110, 160, 0.15)",
                                        }}
                                    >
                                        SOURCE IP
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "16px 20px",
                                            color:
                                                "#7188ad",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "1px",
                                            borderBottom:
                                                "1px solid rgba(80, 110, 160, 0.15)",
                                        }}
                                    >
                                        ANOMALY SCORE
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "16px 20px",
                                            color:
                                                "#7188ad",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "1px",
                                            borderBottom:
                                                "1px solid rgba(80, 110, 160, 0.15)",
                                        }}
                                    >
                                        STATUS
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "16px 20px",
                                            color:
                                                "#7188ad",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "1px",
                                            borderBottom:
                                                "1px solid rgba(80, 110, 160, 0.15)",
                                        }}
                                    >
                                        TIME
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {suspiciousEvents
                                    .slice(0, 5)
                                    .map(
                                        (
                                            event,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    event._id ||
                                                    event.id ||
                                                    index
                                                }
                                            >

                                                <td
                                                    style={{
                                                        padding:
                                                            "16px 20px",
                                                        color:
                                                            "#61d9ff",
                                                        fontWeight:
                                                            "600",
                                                        borderBottom:
                                                            "1px solid rgba(80, 110, 160, 0.10)",
                                                    }}
                                                >
                                                    {
                                                        event.method ||
                                                        "—"
                                                    }
                                                </td>


                                                <td
                                                    style={{
                                                        padding:
                                                            "16px 20px",
                                                        color:
                                                            "#a9bddb",
                                                        borderBottom:
                                                            "1px solid rgba(80, 110, 160, 0.10)",
                                                        maxWidth:
                                                            "300px",
                                                        overflow:
                                                            "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {
                                                        event.requestUrl ||
                                                        "—"
                                                    }
                                                </td>


                                                <td
                                                    style={{
                                                        padding:
                                                            "16px 20px",
                                                        color:
                                                            "#8ea6ca",
                                                        borderBottom:
                                                            "1px solid rgba(80, 110, 160, 0.10)",
                                                    }}
                                                >
                                                    {
                                                        event.sourceIp ||
                                                        "—"
                                                    }
                                                </td>


                                                <td
                                                    style={{
                                                        padding:
                                                            "16px 20px",
                                                        color:
                                                            "#ff7185",
                                                        fontWeight:
                                                            "600",
                                                        borderBottom:
                                                            "1px solid rgba(80, 110, 160, 0.10)",
                                                    }}
                                                >
                                                    {typeof event.anomalyScore ===
                                                    "number"
                                                        ? event.anomalyScore.toFixed(
                                                              3
                                                          )
                                                        : "—"}
                                                </td>


                                                <td
                                                    style={{
                                                        padding:
                                                            "16px 20px",
                                                        borderBottom:
                                                            "1px solid rgba(80, 110, 160, 0.10)",
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "20px",
                                                            background:
                                                                "rgba(255, 70, 90, 0.10)",
                                                            border:
                                                                "1px solid rgba(255, 70, 90, 0.25)",
                                                            color:
                                                                "#ff7185",
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                "600",
                                                        }}
                                                    >
                                                        ANOMALY
                                                    </span>

                                                </td>


                                                <td
                                                    style={{
                                                        padding:
                                                            "16px 20px",
                                                        color:
                                                            "#7188ad",
                                                        borderBottom:
                                                            "1px solid rgba(80, 110, 160, 0.10)",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {formatDate(
                                                        event.createdAt
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                            </tbody>

                        </table>

                    )}

                </div>

            </section>

        </main>
    );
}

export default Dashboard;