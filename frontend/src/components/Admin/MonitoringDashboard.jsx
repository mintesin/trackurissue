import React, { useState, useEffect } from 'react';
import { BarChart, Activity, AlertTriangle, Database, Server, Clock, Users } from 'lucide-react';
import api from '../../services/api';

const MonitoringDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [healthStatus, setHealthStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [metricsRes, alertsRes, healthRes] = await Promise.all([
                api.get('/api/monitoring/metrics'),
                api.get('/api/monitoring/alerts'),
                api.get('/api/monitoring/health')
            ]);

            setMetrics(metricsRes.data.data);
            setAlerts(alertsRes.data.data.alerts);
            setHealthStatus(healthRes.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch monitoring data');
            console.error('Monitoring data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await api.post(`/api/monitoring/alerts/${alertId}/resolve`);
            setAlerts(alerts.filter(alert => alert.id !== alertId));
        } catch (err) {
            console.error('Failed to resolve alert:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
        { id: 'performance', label: 'Performance', icon: BarChart },
        { id: 'system', label: 'System', icon: Server }
    ];

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Monitoring</h2>
                <p className="text-sm text-gray-600">Real-time system metrics and alerts</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* System Health */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-900">System Health</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    getStatusColor(healthStatus?.status)
                                }`}>
                                    {healthStatus?.status}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(healthStatus?.checks || {}).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{key}</span>
                                        <span className={getStatusColor(value.status)}>
                                            {value.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Request Stats */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Request Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Requests</span>
                                    <span>{formatNumber(metrics?.requests?.total || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Success Rate</span>
                                    <span className="text-green-600">
                                        {((metrics?.requests?.successRate || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Avg Response Time</span>
                                    <span>{(metrics?.requests?.avgResponseTime || 0).toFixed(0)}ms</span>
                                </div>
                            </div>
                        </div>

                        {/* System Resources */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">System Resources</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Memory Usage</span>
                                    <span>
                                        {((metrics?.system?.memory?.usage || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">CPU Load</span>
                                    <span>
                                        {((metrics?.system?.cpu?.loadAverage?.[0] || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Uptime</span>
                                    <span>{formatDuration(metrics?.system?.uptime * 1000 || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-4">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
                                <p className="mt-1 text-sm text-gray-500">System is running smoothly.</p>
                            </div>
                        ) : (
                            alerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${
                                        alert.severity === 'critical' 
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-yellow-300 bg-yellow-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`text-sm font-medium ${
                                                alert.severity === 'critical'
                                                    ? 'text-red-800'
                                                    : 'text-yellow-800'
                                            }`}>
                                                {alert.message}
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleResolveAlert(alert.id)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-6">
                        {/* Database Performance */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Database size={20} className="text-gray-500" />
                                <h3 className="text-sm font-medium text-gray-900">Database Performance</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Total Queries</p>
                                    <p className="text-lg font-semibold">
                                        {formatNumber(metrics?.database?.queries || 0)}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Slow Queries</p>
                                    <p className="text-lg font-semibold text-yellow-600">
                                        {formatNumber(metrics?.database?.slowQueries || 0)}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Error Rate</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        {((metrics?.database?.errorRate || 0) * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cache Performance */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={20} className="text-gray-500" />
                                <h3 className="text-sm font-medium text-gray-900">Cache Performance</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Hit Rate</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {((metrics?.cache?.hitRate || 0) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Cache Hits</p>
                                    <p className="text-lg font-semibold">
                                        {formatNumber(metrics?.cache?.hits || 0)}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Cache Misses</p>
                                    <p className="text-lg font-semibold">
                                        {formatNumber(metrics?.cache?.misses || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Response Time Distribution */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={20} className="text-gray-500" />
                                <h3 className="text-sm font-medium text-gray-900">Response Time Distribution</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Average</p>
                                    <p className="text-lg font-semibold">
                                        {(metrics?.requests?.avgResponseTime || 0).toFixed(0)}ms
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">95th Percentile</p>
                                    <p className="text-lg font-semibold">
                                        {(metrics?.requests?.p95ResponseTime || 0).toFixed(0)}ms
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">99th Percentile</p>
                                    <p className="text-lg font-semibold">
                                        {(metrics?.requests?.p99ResponseTime || 0).toFixed(0)}ms
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="space-y-6">
                        {/* Memory Usage */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Server size={20} className="text-gray-500" />
                                <h3 className="text-sm font-medium text-gray-900">Memory Usage</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Used Memory</span>
                                        <span>
                                            {((metrics?.system?.memory?.usage || 0) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                (metrics?.system?.memory?.usage || 0) > 0.8
                                                    ? 'bg-red-500'
                                                    : (metrics?.system?.memory?.usage || 0) > 0.6
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${(metrics?.system?.memory?.usage || 0) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500">Heap Used</p>
                                        <p className="text-lg font-semibold">
                                            {((metrics?.system?.memory?.heap?.used || 0) / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500">Heap Total</p>
                                        <p className="text-lg font-semibold">
                                            {((metrics?.system?.memory?.heap?.total || 0) / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500">External</p>
                                        <p className="text-lg font-semibold">
                                            {((metrics?.system?.memory?.external || 0) / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CPU Usage */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={20} className="text-gray-500" />
                                <h3 className="text-sm font-medium text-gray-900">CPU Usage</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Load Average (1m)</p>
                                    <p className="text-lg font-semibold">
                                        {(metrics?.system?.cpu?.loadAverage?.[0] || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Load Average (5m)</p>
                                    <p className="text-lg font-semibold">
                                        {(metrics?.system?.cpu?.loadAverage?.[1] || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Load Average (15m)</p>
                                    <p className="text-lg font-semibold">
                                        {(metrics?.system?.cpu?.loadAverage?.[2] || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Server size={20} className="text-gray-500" />
                                <h3 className="text-sm font-medium text-gray-900">System Information</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Platform</span>
                                    <span>{metrics?.system?.platform}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Node Version</span>
                                    <span>{metrics?.system?.nodeVersion}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Uptime</span>
                                    <span>{formatDuration(metrics?.system?.uptime * 1000 || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitoringDashboard;
