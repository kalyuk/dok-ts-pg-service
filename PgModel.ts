import {BaseModel} from 'dok-ts/base/BaseModel';
import {Client} from 'pg';

export interface FindOneInterface {
  attributes?: string[];
  where: string
}

export interface FindInterface extends FindOneInterface {
  attributes?: string[];
  where: string
  limit?: number;
  offset?: number;
}

export class PgModel extends BaseModel {
  public static $tableName;
  public static $db: Client;

  public static query(query, values) {
    return this.$db.query(query, values);
  }

  public static async find({attributes, where}: FindInterface, values) {
    const data = await this.query('SELECT ' +
      (attributes ? attributes.join(',') : '*') +
      ' FROM ' + this.$tableName +
      (where ? ' WHERE ' + where : '') +
      ' LIMIT 1', values);

    if (data) {
      return data.rows[0];
    }

    return null;
  }

  public static findAll({attributes, where, limit, offset}: FindInterface, values) {
    return this.query(`
    SELECT
    ${attributes ? attributes.join(',') : '*'}
    FROM
    ${this.$tableName}
    ${where ? 'WHERE ' + where : ''}
    LIMIT
    ${limit ? limit : 10}
    OFFSET ${offset ? offset : 0}
      `, values);
  }
}