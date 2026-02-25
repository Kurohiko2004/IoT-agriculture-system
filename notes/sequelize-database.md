# sequlize in ./models/index.js
```js
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database, 
    config.username, 
    config.password, 
    config
  );
}
```
## 1.Trường hợp 1 -  use_env_variable
- if-condition runs when `use_env_variable` exists. There should be something like this in config/config.json...
```json
{
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "mysql"
  }
}
```

- ...and something like this in `.env`:

DATABASE_URL=mysql://user:password@host:3306/dbname

Altogether, all database information is stored into a string like this:
```js
new Sequelize("mysql://user:password@host:3306/dbname", config)
```
This method is used commonly when deploying onto cloud platforms such as: Heroku, Render, Railway; 
because they only provide database in form of DATABASE_URL, not in seperate variables like DB_USER, DB_PASSWORD...

## 2. Trường hợp 2 - Không có use_env_variable
- else-condition runs when config/config.json looks like this:
``` json
{
  "development": {
    "username": "root",
    "password": "",
    "database": "mydb",
    "host": "localhost",
    "dialect": "mysql"
  }
}
```
