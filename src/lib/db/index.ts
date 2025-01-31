import initSqlJs from 'sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { SCHEMA } from './schema';

let _db: any = null;

export async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  });

  const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir('/sql');
  SQL.FS.mount(sqlFS, {}, '/sql');

  const path = '/sql/db.sqlite';
  if (typeof SharedArrayBuffer === 'undefined') {
    const stream = SQL.FS.open(path, 'w+');
    SQL.FS.close(stream);
  }

  _db = new SQL.Database(path, { filename: true });
  
  // Initialize schema
  _db.run(SCHEMA);
  
  return _db;
}

export async function query(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.exec(sql, params);
}

export async function run(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.run(sql, params);
}