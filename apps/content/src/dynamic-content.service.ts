import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DynamicContentService {
  constructor(private dataSource: DataSource) {}

  private contentTypeServiceUrl =
    process.env.CONTENT_TYPE_SERVICE_URL || 'http://localhost:7082';

  private getTable(apiId: string) { return `ct_${apiId}`; }

  private async ensureContentTypeExists(apiId: string) {
    try {
      const response = await fetch(
        `${this.contentTypeServiceUrl}/api/content-types/api-id/${apiId}`,
      );
      if (!response.ok) {
        throw new Error('Content type lookup failed');
      }
      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: unknown }
        | null;
      if (!payload || payload.success === false || !payload.data) {
        throw new Error('Content type not found');
      }
    } catch {
      throw new NotFoundException(`Content type not found: ${apiId}`);
    }
  }

  private async ensureTableExists(table: string, apiId: string) {
    const tableNameWithoutQuotes = table.replace(/"/g, '');
    const tableExists = await this.dataSource.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
      [tableNameWithoutQuotes],
    );

    if (!tableExists[0]?.exists) {
      throw new NotFoundException(
        `Content type with API ID "${apiId}" does not exist. Please create the content type first.`,
      );
    }
  }

  async create(apiId: string, data: Record<string, any>) {
    const table = this.getTable(apiId);

    await this.ensureContentTypeExists(apiId);
    await this.ensureTableExists(table, apiId);
    
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

    await this.ensureContentTypeExists(apiId);
    await this.ensureTableExists(table, apiId);
    
    let sql = `SELECT * FROM "${table}"`;
    const params = [];
    
    if (filters && Object.keys(filters).length > 0) {
      const where = Object.keys(filters).map((k, i) => {
        params.push(filters[k]);
        return `"${k}" = $${i + 1}`;
      }).join(' AND ');
      sql += ` WHERE ${where}`;
    }

    return this.dataSource.query(sql, params);
  }

  async findOne(apiId: string, id: number) {
    const table = this.getTable(apiId);

    await this.ensureContentTypeExists(apiId);
    await this.ensureTableExists(table, apiId);
    
    const res = await this.dataSource.query(
      `SELECT * FROM "${table}" WHERE id = $1`, [id]
    );
    if (!res.length) throw new NotFoundException(`Content with id ${id} not found`);
    return res[0];
  }

  async update(apiId: string, id: number, data: any) {
    await this.findOne(apiId, id);
    const table = this.getTable(apiId);
    const updates = Object.keys(data).map((k, i) => `"${k}" = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(data)];

    const sql = `UPDATE "${table}" SET ${updates}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const res = await this.dataSource.query(sql, values);
    return res[0];
  }

  async delete(apiId: string, id: number) {
    await this.findOne(apiId, id);
    await this.dataSource.query(`DELETE FROM "${this.getTable(apiId)}" WHERE id = $1`, [id]);
  }
}
