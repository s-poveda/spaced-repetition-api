require('dotenv').config();

const knex = require('knex');
const app = require('./app');
let { PORT, DB_URL, SSL } = require('./config');

if (SSL !==  null) {
	switch (SSL.toLowerCase()) {
		case true:
			SSL = true;
			break;
		case false:
			SSL = false;
	}
}

const db = knex({
  client: 'pg',
  connection: DB_URL + `${typeof SSL === 'boolean' ? `?ssl=${SSL}` : ''}`,
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
