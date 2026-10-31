const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
let db;

initSqlJs().then(function(SQL) {
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS absensi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      keterangan TEXT,
      tanggal TEXT NOT NULL,
      jam TEXT NOT NULL,
      bukti_file TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Database siap digunakan');
});

module.exports = {
  run: function(sql, params, callback) {
    try {
      db.run(sql, params);
      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
      if (callback) callback(null);
    } catch (e) {
      if (callback) callback(e);
    }
  },
  all: function(sql, params, callback) {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      if (callback) callback(null, rows);
    } catch (e) {
      if (callback) callback(e);
    }
  },
  get: function(sql, params, callback) {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      let row = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      if (callback) callback(null, row);
    } catch (e) {
      if (callback) callback(e);
    }
  }
};
