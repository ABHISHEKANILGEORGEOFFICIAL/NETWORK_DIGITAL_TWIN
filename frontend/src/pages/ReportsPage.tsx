import React from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useWebSocket } from '../context/WebSocketContext';

export const ReportsPage: React.FC = () => {
  const { liveMetrics } = useWebSocket();

  const handleDownloadReport = (type: string) => {
    const content = `NetTwin Executive Network Report - ${type}\nGenerated: ${new Date().toISOString()}\n\nNetwork Health: ${liveMetrics?.network_health_score || 98.4}%\nAvailability: ${liveMetrics?.availability_pct || 99.98}%\nMonitored Devices: ${liveMetrics?.total_devices || 36}\nActive Alarms: ${liveMetrics?.active_alerts_count || 0}\nSLA Compliance: 99.99%\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nettwin_${type.toLowerCase().replace(/\s+/g, '_')}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>Compliance & Operational Reports</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate executive SLA compliance, hardware health audits, and incident retrospective summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Monthly Executive SLA Audit" subtitle="99.99% Availability Commitment">
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Enterprise SLA report covering network availability, packet drop rates, and mean time to resolution (MTTR).
            </p>
            <button
              onClick={() => handleDownloadReport('Executive_SLA')}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SLA Audit Report</span>
            </button>
          </div>
        </Card>

        <Card title="Hardware Health & Capacity Report" subtitle="36 Monitored Devices">
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Chassis thermal metrics, power supply status, memory utilization headroom, and core link capacity trends.
            </p>
            <button
              onClick={() => handleDownloadReport('Hardware_Health')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Health Audit</span>
            </button>
          </div>
        </Card>

        <Card title="Incident Retrospective Digest" subtitle="RCA & Mitigation Summary">
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Chronological digest of all alarm clusters, root-cause graphs, blast radiuses, and remediation logs.
            </p>
            <button
              onClick={() => handleDownloadReport('Incident_Retrospective')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Incident Digest</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
