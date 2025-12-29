import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DynamicTableService {
  constructor(private dataSource: DataSource) {}

  async createTable(apiId: string, fields: any[]) {
    const tableName = `ct_${apiId}`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const getSqlType = (type: string) => {
      const map = {
        'SHORT_TEXT': 'VARCHAR(255)',
        'LONG_TEXT': 'TEXT',
        'RICH_TEXT': 'TEXT',
        'NUMBER': 'NUMERIC',
        'BOOLEAN': 'BOOLEAN',
        'DATETIME': 'TIMESTAMP',
        'MEDIA': 'INTEGER',
        'RELATION': 'INTEGER'
      };
      return map[type] || 'VARCHAR(255)';
    };

    let sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

    fields.forEach(f => {
      sql += `, "${f.fieldName}" ${getSqlType(f.type)}`;
      if (f.required) sql += ' NOT NULL';
      if (f.unique) sql += ' UNIQUE';
    });

    sql += ');';

    await queryRunner.query(sql);
    await queryRunner.release();
  }

  async dropTable(apiId: string) {
    const tableName = `ct_${apiId}`;
    await this.dataSource.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
  }
}