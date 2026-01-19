# air-quality-monitor

Air quality monitor using SCD30 CO2 sensor and BMP280 pressure sensor.

This application reads sensor data from air quality sensors and publishes the measurements to an MQTT broker with Home Assistant auto-discovery support.

## Configuration

Create a `.env` file with the following environment variables:

### MQTT Configuration (Required)
```
MQTT_BROKER_URL=mqtt://your-mqtt-broker:1883
MQTT_USERNAME=your-username
MQTT_PASSWORD=your-password
MQTT_CLIENT_ID=air_quality_monitor_01
MQTT_TOPIC_PREFIX=homeassistant/sensor
MQTT_DEVICE_NAME=Air Quality Monitor
MQTT_DEVICE_ID=air_quality_monitor_01
MQTT_ENABLE_HA_DISCOVERY=true
```

### Sensor Configuration
```
LOCAL_ELEVATION=100
```

## Home Assistant Integration

The application automatically integrates with Home Assistant through MQTT Discovery when `MQTT_ENABLE_HA_DISCOVERY=true` (default).

### Auto-Discovery Topics
For each sensor, two MQTT topics are published:

**Discovery Configuration:**
- `homeassistant/sensor/{DEVICE_ID}_{SENSOR_NAME}/config`

**State Data:**
- `homeassistant/sensor/{DEVICE_ID}_{SENSOR_NAME}/state`

### Supported Sensors
- **CO₂ Concentration** (`co2_concentration`) - ppm with carbon_dioxide device class
- **SCD30 Temperature** (`scd30_temperature`) - °C with temperature device class  
- **BMP280 Temperature** (`bmp280_temperature`) - °C with temperature device class
- **Humidity** (`relative_humidity`) - % with humidity device class
- **Pressure** (`mean_sea_level_pressure`) - hPa with pressure device class

### Discovery Configuration Example
```json
{
  "name": "CO₂ Concentration",
  "unique_id": "air_quality_monitor_01_co2_concentration",
  "state_topic": "homeassistant/sensor/air_quality_monitor_01_co2_concentration/state", 
  "unit_of_measurement": "ppm",
  "device_class": "carbon_dioxide",
  "state_class": "measurement",
  "icon": "mdi:molecule-co2",
  "device": {
    "identifiers": ["air_quality_monitor_01"],
    "name": "Air Quality Monitor",
    "model": "Air Quality Monitor",
    "manufacturer": "DIY",
    "sw_version": "1.0.0"
  }
}
```

### State Data Example
State topics publish simple numeric values:
```
900
```

The sensors will automatically appear in Home Assistant and can be used in dashboards, automations, and history tracking.

## Manual MQTT Topics (if discovery disabled)

When `MQTT_ENABLE_HA_DISCOVERY=false`, only state topics are published:

- `{MQTT_TOPIC_PREFIX}/{DEVICE_ID}_co2_concentration/state`
- `{MQTT_TOPIC_PREFIX}/{DEVICE_ID}_scd30_temperature/state`  
- `{MQTT_TOPIC_PREFIX}/{DEVICE_ID}_bmp280_temperature/state`
- `{MQTT_TOPIC_PREFIX}/{DEVICE_ID}_relative_humidity/state`
- `{MQTT_TOPIC_PREFIX}/{DEVICE_ID}_mean_sea_level_pressure/state`

## Installation and Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your `.env` file with the required configuration

3. Build the project:
   ```bash
   npm run build
   ```

4. Run the application:
   ```bash
   node dist/index.js
   ```

## Testing

Run the test suite:
```bash
npm test
```
