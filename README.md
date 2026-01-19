# air-quality-monitor

Air quality monitor using SCD30 CO2 sensor and BMP280 pressure sensor.

This application reads sensor data from air quality sensors and publishes the measurements to an MQTT broker.

## Configuration

Create a `.env` file with the following environment variables:

### MQTT Configuration (Required)
```
MQTT_BROKER_URL=mqtt://your-mqtt-broker:1883
MQTT_USERNAME=your-username (unless anonymous)
MQTT_PASSWORD=your-password (unless anonymous)
MQTT_CLIENT_ID=air_quality_monitor_01
MQTT_TOPIC_PREFIX=home/air_quality/study
```

### Sensor Configuration
```
LOCAL_ELEVATION=100 (in metres)
```

## MQTT Topic Structure

The application publishes data to the following MQTT topics:

### Individual Sensor Readings
- `{MQTT_TOPIC_PREFIX}/co2_concentration` - CO2 concentration in ppm
- `{MQTT_TOPIC_PREFIX}/scd30_temperature` - SCD30 temperature in °C
- `{MQTT_TOPIC_PREFIX}/bmp280_temperature` - BMP280 temperature in °C
- `{MQTT_TOPIC_PREFIX}/relative_humidity` - Relative humidity in %
- `{MQTT_TOPIC_PREFIX}/mean_sea_level_pressure` - Mean sea level pressure in hPa

### Summary Data
- `{MQTT_TOPIC_PREFIX}/summary` - All sensor readings in a single payload

Each topic payload includes:
```json
{
  "value": 900,
  "unit": "ppm",
  "timestamp": "2025-01-18T10:30:00.000Z"
}
```

The summary topic includes all sensor readings:
```json
{
  "co2Concentration": 900,
  "scd30Temperature": 20.5,
  "bmp280Temperature": 19.8,
  "relativeHumidity": 45.2,
  "meanSeaLevelPressure": 1013.25,
  "timestamp": "2025-01-18T10:30:00.000Z"
}
```

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
