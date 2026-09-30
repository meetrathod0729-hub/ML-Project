import API_URL from "../config";
import { useEffect, useMemo, useState } from "react";

function Analytics() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchEvents = async () => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/api/events`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch analytics data");
            }

            const data = await response.json();

            if (data.success) {
                setEvents(data.events || []);
            } else {
                throw new Error(
                    data.message || "Failed to fetch events"
                );
            }
        } catch (err) {
            console.error("Analytics Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();

        const interval = setInterval(fetchEvents, 10000);

        return () => clearInterval(interval);
    }, []);

    const analytics = useMemo(() => {
        const total = events.length;

        const anomalies = events.filter(
            (event) =>
                event.prediction?.toLowerCase() === "anomaly"
        ).length;

        const normal = total - anomalies;

        const anomalyRate =
            total > 0
                ? ((anomalies / total) * 100).toFixed(1)
                : "0.0";

        const avgResponseTime =
            total > 0
                ? (
                      events.reduce(
                          (sum, event) =>
                              sum + Number(event.responseTime || 0),
                          0
                      ) / total
                  ).toFixed(1)
                : "0.0";

        const avgAnomalyScore =
            total > 0
                ? (
                      events.reduce(
                          (sum, event) =>
                              sum + Number(event.anomalyScore || 0),
                          0
                      ) / total
                  ).toFixed(3)
                : "0.000";

        const thresholds = events
            .map((event) => Number(event.threshold))
            .filter((value) => !Number.isNaN(value));

        const detectionThreshold =
            thresholds.length > 0
                ? (
                      thresholds.reduce(
                          (sum, value) => sum + value,
                          0
                      ) / thresholds.length
                  ).toFixed(3)
                : "â€”";

        return {
            total,
            anomalies,
            normal,
            anomalyRate,
            avgResponseTime,
            avgAnomalyScore,
            detectionThreshold
        };
    }, [events]);

    const methodDistribution = useMemo(() => {
        const distribution = {};

        events.forEach((event) => {
            const method = event.method || "UNKNOWN";

            distribution[method] =
                (distribution[method] || 0) + 1;
        });

        return Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .map(([method, count]) => ({
                method,
                count,
                percentage:
                    events.length > 0
                        ? ((count / events.length) * 100).toFixed(1)
                        : "0.0"
            }));
    }, [events]);

    const statusDistribution = useMemo(() => {
        const distribution = {};

        events.forEach((event) => {
            const status = event.status || 0;

            distribution[status] =
                (distribution[status] || 0) + 1;
        });

        return Object.entries(distribution)
            .sort((a, b) => Number(a[0]) - Number(b[0]));
    }, [events]);

    const trafficData = useMemo(() => {
        const now = new Date();

        const hours = [];

        for (let i = 23; i >= 0; i--) {
            const time = new Date(now);
            time.setMinutes(0, 0, 0);
            time.setHours(time.getHours() - i);

            hours.push({
                hour: time,
                total: 0,
                anomalies: 0
            });
        }

        events.forEach((event) => {
            if (!event.createdAt) return;

            const eventTime = new Date(event.createdAt);

            const matchingHour = hours.find(
                (item) =>
                    item.hour.getFullYear() ===
                        eventTime.getFullYear() &&
                    item.hour.getMonth() ===
                        eventTime.getMonth() &&
                    item.hour.getDate() ===
                        eventTime.getDate() &&
                    item.hour.getHours() ===
                        eventTime.getHours()
            );

            if (matchingHour) {
                matchingHour.total++;

                if (
                    event.prediction?.toLowerCase() ===
                    "anomaly"
                ) {
                    matchingHour.anomalies++;
                }
            }
        });

        return hours;
    }, [events]);

    const maxTraffic = Math.max(
        ...trafficData.map((item) => item.total),
        1
    );

    const formatHour = (date) =>
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    if (loading) {
        return (
            <main className="dashboard">
                <div className="loading-state">
                    Loading analytics...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard">
                <div className="error-state">
                    <h3>Unable to load analytics</h3>
                    <p>{error}</p>

                    <button
                        className="refresh-button"
                        onClick={fetchEvents}
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">

            {/* Heading */}
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        SECURITY ANALYTICS
                    </span>

                    <h2>API Traffic Analytics</h2>

                    <p>
                        Analyze API traffic patterns and
                        machine learning detection metrics.
                    </p>
                </div>

                <div className="dashboard-status">
                    <span></span>
                    Live Analytics
                </div>
            </div>

            {/* Statistics */}
            <section className="stats-grid">

                <div className="stat-card">
                    <span className="stat-title">
                        TOTAL REQUESTS
                    </span>

                    <strong>
                        {analytics.total}
                    </strong>

                    <span className="stat-subtitle">
                        Analyzed API requests
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-title">
                        NORMAL TRAFFIC
                    </span>

                    <strong>
                        {analytics.normal}
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
                        {analytics.anomalies}
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
                        {analytics.anomalyRate}%
                    </strong>

                    <span className="stat-subtitle">
                        Of analyzed traffic
                    </span>
                </div>

            </section>

            {/* ML Metrics */}
            <section className="stats-grid analytics-secondary-stats">

                <div className="stat-card">
                    <span className="stat-title">
                        AVG RESPONSE TIME
                    </span>

                    <strong>
                        {analytics.avgResponseTime}
                        <small> ms</small>
                    </strong>

                    <span className="stat-subtitle">
                        Average API response
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-title">
                        AVG ANOMALY SCORE
                    </span>

                    <strong>
                        {analytics.avgAnomalyScore}
                    </strong>

                    <span className="stat-subtitle">
                        ML reconstruction error
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-title">
                        DETECTION THRESHOLD
                    </span>

                    <strong>
                        {analytics.detectionThreshold}
                    </strong>

                    <span className="stat-subtitle">
                        Current ML threshold
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-title">
                        DETECTION ENGINE
                    </span>

                    <strong className="engine-online">
                        ONLINE
                    </strong>

                    <span className="stat-subtitle">
                        Autoencoder detection
                    </span>
                </div>

            </section>

            {/* Traffic + Methods */}
            <section className="dashboard-grid">

                {/* Traffic */}
                <div className="dashboard-panel traffic-panel">

                    <div className="panel-heading">

                        <div>
                            <h3>Traffic Activity</h3>

                            <p>
                                API requests during the last
                                24 hours
                            </p>
                        </div>

                        <div className="panel-filter">
                            Last 24 hours
                        </div>

                    </div>

                    <div className="analytics-chart">

                        {trafficData.map(
                            (item, index) => {

                                const height =
                                    item.total === 0
                                        ? 4
                                        : Math.max(
                                              (item.total /
                                                  maxTraffic) *
                                                  100,
                                              8
                                          );

                                const anomalyHeight =
                                    item.anomalies === 0
                                        ? 0
                                        : Math.max(
                                              (item.anomalies /
                                                  maxTraffic) *
                                                  100,
                                              5
                                          );

                                return (
                                    <div
                                        className="traffic-bar-wrapper"
                                        key={index}
                                    >

                                        <div className="traffic-bar-area">

                                            <div
                                                className="traffic-bar"
                                                style={{
                                                    height: `${height}%`
                                                }}
                                            />

                                            {item.anomalies >
                                                0 && (
                                                <div
                                                    className="traffic-anomaly-bar"
                                                    style={{
                                                        height: `${anomalyHeight}%`
                                                    }}
                                                />
                                            )}

                                        </div>

                                        <span>
                                            {index % 4 ===
                                            0
                                                ? formatHour(
                                                      item.hour
                                                  )
                                                : ""}
                                        </span>

                                    </div>
                                );
                            }
                        )}

                    </div>

                    <div className="chart-legend">

                        <div>
                            <span className="legend-dot traffic-dot"></span>
                            Total Requests
                        </div>

                        <div>
                            <span className="legend-dot anomaly-dot"></span>
                            Anomalies
                        </div>

                    </div>

                </div>

                {/* HTTP Methods */}
                <div className="dashboard-panel">

                    <div className="panel-heading">

                        <div>
                            <h3>HTTP Methods</h3>

                            <p>
                                Request distribution
                            </p>
                        </div>

                    </div>

                    <div className="analytics-list">

                        {methodDistribution.length ===
                        0 ? (
                            <div className="empty-state">
                                No request data available
                            </div>
                        ) : (
                            methodDistribution.map(
                                (item) => (
                                    <div
                                        className="analytics-list-item"
                                        key={item.method}
                                    >

                                        <div className="analytics-list-header">

                                            <span>
                                                {item.method}
                                            </span>

                                            <strong>
                                                {item.count}
                                            </strong>

                                        </div>

                                        <div className="progress-track">

                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${item.percentage}%`
                                                }}
                                            />

                                        </div>

                                        <small>
                                            {item.percentage}%
                                            of requests
                                        </small>

                                    </div>
                                )
                            )
                        )}

                    </div>

                </div>

            </section>

            {/* Status Codes */}
            <section className="dashboard-panel">

                <div className="panel-heading">

                    <div>
                        <h3>HTTP Status Codes</h3>

                        <p>
                            Response status distribution
                        </p>
                    </div>

                </div>

                <div className="status-grid">

                    {statusDistribution.length ===
                    0 ? (
                        <div className="empty-state">
                            No status code data available
                        </div>
                    ) : (
                        statusDistribution.map(
                            ([status, count]) => (
                                <div
                                    className="status-card"
                                    key={status}
                                >

                                    <strong>
                                        {status}
                                    </strong>

                                    <span>
                                        {count} request
                                        {count !== 1
                                            ? "s"
                                            : ""}
                                    </span>

                                </div>
                            )
                        )
                    )}

                </div>

            </section>

        </main>
    );
}

export default Analytics;
