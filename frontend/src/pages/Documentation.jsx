import {
    Shield,
    Brain,
    Activity,
    Server,
    Database,
    Lock
} from "lucide-react";


function Documentation() {

    return (

        <main className="dashboard">

            <div className="page-heading">

                <div>

                    <span className="page-eyebrow">
                        API SENTINEL
                    </span>

                    <h2>
                        Documentation
                    </h2>

                    <p>
                        Understand how API Sentinel monitors
                        and detects anomalous API behavior.
                    </p>

                </div>

            </div>


            <section className="documentation-grid">

                <div className="dashboard-panel documentation-card">

                    <Shield size={25} />

                    <h3>
                        API Monitoring
                    </h3>

                    <p>
                        API Sentinel continuously analyzes
                        incoming API requests and records
                        important request characteristics.
                    </p>

                </div>


                <div className="dashboard-panel documentation-card">

                    <Brain size={25} />

                    <h3>
                        Machine Learning Detection
                    </h3>

                    <p>
                        The machine learning service analyzes
                        API request features and identifies
                        behavior that differs from normal
                        traffic patterns.
                    </p>

                </div>


                <div className="dashboard-panel documentation-card">

                    <Activity size={25} />

                    <h3>
                        Anomaly Detection
                    </h3>

                    <p>
                        Each analyzed request receives a
                        prediction and anomaly score that
                        can be monitored through the dashboard.
                    </p>

                </div>


                <div className="dashboard-panel documentation-card">

                    <Server size={25} />

                    <h3>
                        Backend
                    </h3>

                    <p>
                        The Node.js and Express backend handles
                        authentication, API events, dashboard
                        statistics and communication with the
                        ML service.
                    </p>

                </div>


                <div className="dashboard-panel documentation-card">

                    <Database size={25} />

                    <h3>
                        MongoDB
                    </h3>

                    <p>
                        API events and application data are
                        persisted using MongoDB.
                    </p>

                </div>


                <div className="dashboard-panel documentation-card">

                    <Lock size={25} />

                    <h3>
                        Authentication
                    </h3>

                    <p>
                        API Sentinel uses JWT-based authentication
                        to protect access to the security dashboard.
                    </p>

                </div>

            </section>


            <section className="dashboard-panel documentation-flow">

                <div className="panel-heading">

                    <div>

                        <h3>
                            Detection Pipeline
                        </h3>

                        <p>
                            High-level architecture of API Sentinel.
                        </p>

                    </div>

                </div>


                <div className="pipeline">

                    <div className="pipeline-step">
                        <strong>1</strong>
                        <span>API Request</span>
                    </div>

                    <div className="pipeline-arrow">
                        →
                    </div>

                    <div className="pipeline-step">
                        <strong>2</strong>
                        <span>Feature Engineering</span>
                    </div>

                    <div className="pipeline-arrow">
                        →
                    </div>

                    <div className="pipeline-step">
                        <strong>3</strong>
                        <span>ML Model</span>
                    </div>

                    <div className="pipeline-arrow">
                        →
                    </div>

                    <div className="pipeline-step">
                        <strong>4</strong>
                        <span>Anomaly Score</span>
                    </div>

                    <div className="pipeline-arrow">
                        →
                    </div>

                    <div className="pipeline-step">
                        <strong>5</strong>
                        <span>Dashboard</span>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default Documentation;