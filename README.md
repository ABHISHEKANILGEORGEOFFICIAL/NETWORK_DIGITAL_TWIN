# NetTwin – Network Digital Twin & Monitoring Platform

NetTwin is a real-time **Network Digital Twin and Network Operations Platform** designed to model, monitor, simulate, and analyze modern computer networks.

The platform provides a digital representation of network infrastructure including devices, interfaces, links, traffic, topology, health metrics, alerts, and network events.

It combines **real-time network monitoring, digital twin simulation, topology visualization, anomaly detection, health analysis, and what-if scenarios** into a unified platform.

---

## 🚀 Key Features

### 📊 Network Operations Dashboard

- Real-time network health monitoring
- Device availability monitoring
- Network latency monitoring
- Packet-loss monitoring
- Throughput monitoring
- Overall network health score
- Active alert monitoring
- Top traffic generators
- Infrastructure tier breakdown

### 🌐 Live Network Topology

- Interactive network topology visualization
- Core, distribution, access and workload layers
- Device status visualization
- Link status monitoring
- Topology search
- Device filtering
- Health-based filtering
- Path highlighting
- Network route tracing

### 🖥️ Device Monitoring

Monitor network infrastructure including:

- Routers
- Switches
- Firewalls
- Servers
- Wireless access points
- Data-center workloads

Device information includes:

- CPU utilization
- Memory utilization
- Interface status
- Availability
- Traffic statistics
- Device health
- Alerts and incidents

### 🔌 Interface Monitoring

Monitor individual network interfaces for:

- Interface status
- Inbound traffic
- Outbound traffic
- Utilization
- Errors
- Packet drops
- Interface health

### 🚨 Alert & Incident Management

The platform provides automated detection of network problems.

Supported capabilities include:

- Real-time alerts
- Warning and critical thresholds
- Alert severity classification
- Alert correlation
- Incident management
- Root-cause analysis
- Alert history
- Device-specific alerts

### 🧠 Network Health Analysis

NetTwin calculates network health using multiple telemetry signals including:

- Availability
- CPU utilization
- Memory utilization
- Latency
- Packet loss
- Interface health

The platform produces a composite network health score to provide operators with a quick overview of network condition.

### 🔬 Digital Twin Simulation

The Digital Twin represents the network in a simulated environment.

The simulation engine can model:

- Device state
- Link state
- Network telemetry
- Traffic behavior
- Network failures
- Performance degradation
- Network recovery

This allows network operators to analyze network behavior without directly affecting production infrastructure.

### 🔮 What-If Analysis

Network operators can evaluate hypothetical scenarios such as:

- What happens if a router fails?
- What happens if a link goes down?
- What happens if latency increases?
- What happens if packet loss increases?
- What happens if CPU utilization reaches a critical level?

The system can analyze the potential impact on the network topology and affected devices.

### 🛣️ Path Analysis

Analyze communication paths between network devices.

Capabilities include:

- Source and destination selection
- Route discovery
- Path visualization
- Link analysis
- Failure impact analysis
- Route highlighting

### 📈 Traffic Analytics

Analyze network traffic using:

- Inbound traffic
- Outbound traffic
- Throughput
- Traffic generators
- Network flows
- Interface utilization

### ⚙️ Configuration & Network Management

The platform provides a centralized interface for network management operations including:

- Configuration management
- Network management
- Hardware inventory
- Compliance reporting
- Device information

### 🔐 Role-Based Access Control

NetTwin supports multiple user roles:

| Role | Access |
|------|--------|
| Admin | Full platform access |
| Engineer | Network monitoring and simulation |
| Viewer | Read-only access |

### ⚡ Real-Time Communication

NetTwin uses WebSockets for real-time updates.

Real-time channels include:

- Telemetry updates
- Alert notifications
- Network state changes
- Simulation events

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │       NetTwin UI         │
                    │     React + TypeScript   │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API
                                 │ WebSocket
                                 ▼
                    ┌──────────────────────────┐
                    │       FastAPI Backend     │
                    │          Python           │
                    └────────────┬─────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
             ▼                   ▼                   ▼
      ┌─────────────┐     ┌──────────────┐   ┌──────────────┐
      │ Digital Twin│     │ Detection &  │   │  Network     │
      │  Simulator  │     │ Correlation  │   │  Services    │
      └──────┬──────┘     └──────┬───────┘   └──────┬───────┘
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │        Database          │
                    │ Devices / Links /        │
                    │ Telemetry / Alerts /     │
                    │ Incidents / Users        │
                    └──────────────────────────┘
