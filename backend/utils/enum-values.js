const SensorType = Object.freeze({
    TEMPERATURE: 'temperature',
    HUMIDITY: 'humidity',
    LIGHT: 'light',
    MOISTURE: 'moisture'
});

const SortBy = Object.freeze({
    MEASURED_AT: 'measuredAt',
    VALUE: 'value'
});

const SortOrder = Object.freeze({
    ASC: 'ASC',
    DESC: 'DESC'
});

const Action = Object.freeze({
    TURN_ON: 'TURN_ON',
    TURN_OFF: 'TURN_OFF'
})