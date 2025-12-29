import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DynamicContentService {
  constructor(private dataSource: DataSource) {}

  private getTable(apiId: string) { return `ct_${apiId}`; }

  async create(apiId: string, data: Record<string, any>) {
    const table = this.getTable(apiId);
    
    const columns = Object.keys(data).map(k => `"${k}"`).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) RETURNING *`;
    
    try {
      const res = await this.dataSource.query(sql, values);
      return res[0];
    } catch (e) {
      throw new Error(`Failed to insert into ${table}: ${e.message}`);
    }
  }

  async findAll(apiId: string, filters: any) {
    const table = this.getTable(apiId);
    let sql = `SELECT * FROM "${table}"`;
    const params = [];
    
    if (Object.keys(filters).length > 0) {
      const where = Object.keys(filters).map((k, i) => {
        params.push(filters[k]);
        return `"${k}" = $${i + 1}`;
      }).join(' AND ');
      sql += ` WHERE ${where}`;
    }

    return this.dataSource.query(sql, params);
  }

  async findOne(apiId: string, id: number) {
    const res = await this.dataSource.query(
      `SELECT * FROM "${this.getTable(apiId)}" WHERE id = $1`, [id]
    );
    if (!res.length) throw new NotFoundException();
    return res[0];
  }

  async update(apiId: string, id: number, data: any) {
    const table = this.getTable(apiId);
    const updates = Object.keys(data).map((k, i) => `"${k}" = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(data)];

    const sql = `UPDATE "${table}" SET ${updates}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const res = await this.dataSource.query(sql, values);
    return res[0];
  }

  async delete(apiId: string, id: number) {
    await this.dataSource.query(`DELETE FROM "${this.getTable(apiId)}" WHERE id = $1`, [id]);
  }
}