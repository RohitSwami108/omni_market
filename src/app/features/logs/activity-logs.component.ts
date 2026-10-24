import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type LogSeverity = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  userContext: {
    id: string;
    email: string;
    ip: string;
    role: string;
  };
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  latencyMs: number;
  summary: string;
  stackTrace?: string;
  payloadJson?: string;
  headers?: Record<string, string>;
}

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss'
})
export class ActivityLogsComponent {
  // Filter Signals
  readonly activeSeverity = signal<LogSeverity>('ALL');
  readonly searchQuery = signal<string>('');
  readonly isLiveStreaming = signal<boolean>(true);
  readonly expandedLogId = signal<string | null>('log-003');
  readonly copiedLogId = signal<string | null>(null);

  // Mock Telemetry Log Feed
  readonly logs = signal<LogEntry[]>([
    {
      id: 'log-001',
      timestamp: '2026-10-24 18:24:12.842',
      severity: 'INFO',
      userContext: {
        id: 'usr_8820',
        email: 'system.worker@omnimarket.internal',
        ip: '10.244.3.118',
        role: 'ClusterDaemon'
      },
      endpoint: '/api/v2/catalog/inventory/sync-deltas',
      method: 'POST',
      statusCode: 200,
      latencyMs: 38,
      summary: 'Batched delta sync committed 142 SKU modifications into primary replica.'
    },
    {
      id: 'log-002',
      timestamp: '2026-10-24 18:23:58.110',
      severity: 'WARN',
      userContext: {
        id: 'usr_4910',
        email: 'vendor.apex@gearlogix.com',
        ip: '198.51.100.44',
        role: 'Vendor'
      },
      endpoint: '/api/v2/products/OGW-EDG-9021/media-presign',
      method: 'PUT',
      statusCode: 429,
      latencyMs: 12,
      summary: 'Rate limit threshold reached: 60/60 requests within sliding 1-minute window.'
    },
    {
      id: 'log-003',
      timestamp: '2026-10-24 18:22:45.302',
      severity: 'ERROR',
      userContext: {
        id: 'usr_9912',
        email: 'devops.lead@omnimarket.io',
        ip: '203.0.113.89',
        role: 'SuperAdmin'
      },
      endpoint: '/api/v2/cluster/failover/elect-leader',
      method: 'POST',
      statusCode: 500,
      latencyMs: 412,
      summary: 'ConsensusQuorumTimeoutException: Raft leader election timed out after 3 retries.',
      stackTrace: `com.omnimarket.consensus.RaftQuorumTimeoutException: Failed to acquire majority ack from quorum nodes [node-eu-west-1b, node-eu-west-1c]
    at com.omnimarket.raft.RaftClusterState.awaitQuorum(RaftClusterState.kt:284)
    at com.omnimarket.raft.LeaderElectionService.triggerElection(LeaderElectionService.kt:142)
    at com.omnimarket.api.v2.ClusterOpsController.electLeader(ClusterOpsController.kt:89)
    at jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:255)
    at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118)
    at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089)
    Caused by: java.net.SocketTimeoutException: Read timed out to 10.240.12.5:9092
    at java.base/sun.nio.ch.NioSocketImpl.timedRead(NioSocketImpl.java:283)
    at java.base/sun.nio.ch.NioSocketImpl.implRead(NioSocketImpl.java:309)`,
      payloadJson: JSON.stringify({
        clusterId: "cluster-us-east-prod-01",
        requestedTerm: 14,
        forceElection: true,
        candidateNode: "node-us-east-1a.internal"
      }, null, 2),
      headers: {
        'x-correlation-id': 'corr-99201-aa8b-4921',
        'x-request-origin': 'ap-gateway-public-02',
        'content-type': 'application/json'
      }
    },
    {
      id: 'log-004',
      timestamp: '2026-10-24 18:21:05.612',
      severity: 'DEBUG',
      userContext: {
        id: 'usr_1029',
        email: 'telemetry.agent@internal',
        ip: '127.0.0.1',
        role: 'Internal'
      },
      endpoint: '/metrics/prometheus',
      method: 'GET',
      statusCode: 200,
      latencyMs: 4,
      summary: 'Prometheus metrics scrapers harvested 1,842 gauge metrics.'
    },
    {
      id: 'log-005',
      timestamp: '2026-10-24 18:20:19.418',
      severity: 'INFO',
      userContext: {
        id: 'usr_3310',
        email: 'sarah.c@auroratech.de',
        ip: '195.201.20.14',
        role: 'Customer'
      },
      endpoint: '/api/v2/orders/ORD-99182/checkout',
      method: 'POST',
      statusCode: 201,
      latencyMs: 148,
      summary: 'Stripe webhook 3D-Secure charge succeeded for $1,249.00 USD.'
    }
  ]);

  // Computed Severity Counts
  readonly counts = computed(() => {
    const raw = this.logs();
    return {
      all: raw.length,
      info: raw.filter(l => l.severity === 'INFO').length,
      warn: raw.filter(l => l.severity === 'WARN').length,
      error: raw.filter(l => l.severity === 'ERROR').length,
      debug: raw.filter(l => l.severity === 'DEBUG').length
    };
  });

  // Filtered Logs
  readonly filteredLogs = computed(() => {
    let result = this.logs();
    const sev = this.activeSeverity();
    const query = this.searchQuery().toLowerCase().trim();

    if (sev !== 'ALL') {
      result = result.filter(l => l.severity === sev);
    }

    if (query) {
      result = result.filter(l => 
        l.endpoint.toLowerCase().includes(query) ||
        l.summary.toLowerCase().includes(query) ||
        l.userContext.email.toLowerCase().includes(query) ||
        l.userContext.ip.includes(query) ||
        l.statusCode.toString().includes(query)
      );
    }

    return result;
  });

  setSeverity(sev: LogSeverity) {
    this.activeSeverity.set(sev);
  }

  toggleRowExpand(id: string) {
    if (this.expandedLogId() === id) {
      this.expandedLogId.set(null);
    } else {
      this.expandedLogId.set(id);
    }
  }

  toggleLiveStream() {
    this.isLiveStreaming.update(v => !v);
  }

  copyStackTrace(log: LogEntry, event: MouseEvent) {
    event.stopPropagation();
    if (log.stackTrace) {
      navigator.clipboard.writeText(log.stackTrace);
      this.copiedLogId.set(log.id);
      setTimeout(() => {
        this.copiedLogId.set(null);
      }, 1500);
    }
  }
}
