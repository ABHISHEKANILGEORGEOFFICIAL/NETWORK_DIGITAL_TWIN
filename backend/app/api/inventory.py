import csv
import io
from fastapi import APIRouter, Response
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("")
def get_inventory():
    items = []
    for dev in simulator.devices.values():
        items.append({
            "id": dev["id"],
            "name": dev["name"],
            "type": dev["type"],
            "vendor": dev.get("vendor", "Cisco"),
            "model": dev.get("model", "Catalyst 9300"),
            "serial_number": f"SN-NT-{abs(hash(dev['id'])) % 900000 + 100000}",
            "os_version": dev.get("os_version", "IOS-XE 17.9"),
            "ip_address": dev["ip_address"],
            "mac_address": dev["mac_address"],
            "location": dev.get("location", "HQ Datacenter"),
            "rack_unit": dev.get("rack_unit", "U10"),
            "status": dev.get("status", "healthy"),
            "health_score": dev.get("health_score", 100.0),
            "uptime_days": round(dev.get("uptime_seconds", 864000) / 86400.0, 1),
            "last_seen": dev.get("last_seen_at", "").isoformat() if hasattr(dev.get("last_seen_at"), "isoformat") else str(dev.get("last_seen_at"))
        })
    return items

@router.get("/export-csv")
def export_inventory_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Device ID", "Device Name", "Type", "Vendor", "Model", "Serial Number",
        "OS Version", "IP Address", "MAC Address", "Location", "Rack Unit", "Status", "Uptime Days"
    ])

    for dev in simulator.devices.values():
        writer.writerow([
            dev["id"],
            dev["name"],
            dev["type"],
            dev.get("vendor", "Cisco"),
            dev.get("model", "Catalyst 9300"),
            f"SN-NT-{abs(hash(dev['id'])) % 900000 + 100000}",
            dev.get("os_version", "IOS-XE 17.9"),
            dev["ip_address"],
            dev["mac_address"],
            dev.get("location", "HQ Datacenter"),
            dev.get("rack_unit", "U10"),
            dev.get("status", "healthy"),
            round(dev.get("uptime_seconds", 864000) / 86400.0, 1)
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nettwin_hardware_inventory.csv"}
    )
