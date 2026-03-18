const db = require('./models');

async function test() {
  try {
    // 1. Check connection
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 2. Create a dummy sensor
    // Using findOrCreate prevents errors if you run this script twice
    const [sensor] = await db.Sensor.findOrCreate({ 
      where: { name: 'DHT11' } 
    });
    
    // 3. Create dummy data linked to that sensor
    // We don't need to pass measuredAt; the DB will use CURRENT_TIMESTAMP automatically
    await db.SensorData.create({
      value: 28.4,
      type: 'temperature',
      sensorId: sensor.id
    });

    await db.SensorData.create({
      value: 65.0,
      type: 'humidity',
      sensorId: sensor.id
    });

    // 4. Test the 'sensorDatas' alias
    const sensorWithData = await db.Sensor.findByPk(sensor.id, {
      include: [{ 
        model: db.SensorData, 
        as: 'sensorDatas' 
      }]
    });

    console.log('--- TEST RESULTS ---');
    console.log(`Sensor Name: ${sensorWithData.name}`);
    console.log(`Readings Found: ${sensorWithData.sensorDatas.length}`);
    
    sensorWithData.sensorDatas.forEach(data => {
      console.log(`- [${data.type}]: ${data.value} at ${data.measuredAt}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Important: close the connection so the script finishes and exits
    await db.sequelize.close();
  }
}

test();