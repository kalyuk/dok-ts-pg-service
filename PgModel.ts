import { BaseModel } from 'dok-ts/base/BaseModel';
import { Client } from 'pg';
import { toCamelCase, toUnder } from './helper';
import { BaseError } from 'dok-ts/base/BaseError';

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
  public id: number = null;
  public static $tableName;
  public static $db: Client;

  public static query(query, values?) {
    return this.$db.query(query, values || []);
  }

  public static async find<T>({attributes, where}: FindInterface, values): Promise<T> {
    const data = await this.query('SELECT ' +
      (attributes ? attributes.join(',') : '*') +
      ' FROM ' + this.$tableName +
      (where ? ' WHERE ' + where : '') +
      ' LIMIT 1', values);

    if (data && data.rows.length) {
      return this.createInstance(data.rows[0]);
    }

    return null;
  }

  public async beforeSave() {

  }

  public async beforeCreate() {

  }

  public async beforeUpdate() {

  }

  public async afterSave(scope?: string) {

  }

  public async afterCreate(scope?: string) {

  }

  public async afterUpdate(scope?: string) {

  }

  public async save(scope?: string) {
    await this.validate(scope);
    if (!this.hasErrors()) {
      if (this.id) {
        await this.beforeUpdate();
      } else {
        await this.beforeCreate();
      }
      await this.beforeSave();

      if (this.id) {
        await this.update(scope)
      } else {
        await this.create(scope);
      }
      await this.afterSave(scope);
      return true;
    }

    return false;
  }

  private async update(scope?) {
    const attributes = [];
    const values = [];

    const {$db, $tableName} = this.constructor as any;

    this.attributes()
      .forEach((attr) => {
        if (this[attr] && attr !== 'id') {
          attributes.push(`${toUnder(attr)}=$${(values.length + 1)}`);
          values.push(this[attr]);
        }
      });

    values.push(this.id);

    await $db.query('UPDATE ' + $tableName + ' SET ' + attributes.join(',') +
      ' WHERE id=$' + (values.length), values);

    await this.afterUpdate(scope);
  }

  private async create(scope?) {
    const attributes = [];
    const indexes = [];
    const values = [];

    const {$db, $tableName} = this.constructor as any;

    this.attributes()
      .forEach((attr) => {
        if (this[attr]) {
          attributes.push(toUnder(attr));
          indexes.push(`$${(values.length + 1)}`);
          values.push(this[attr]);
        }
      });

    const item = await $db.query('INSERT INTO ' + $tableName + '(' + attributes.join(',') + ') ' +
      ' VALUES(' + indexes.join(',') + ') RETURNING id', values);

    this.id = item.rows[0].id;

    await this.afterCreate(scope);
  }

  public static findAll<T>({attributes, where, limit, offset}: FindInterface, values): Promise<T[]> {
    const results = this.query(`
    SELECT
    ${attributes ? attributes.join(',') : '*'}
    FROM
    ${this.$tableName}
    ${where ? 'WHERE ' + where : ''}
    LIMIT
    ${limit ? limit : 10}
    OFFSET ${offset ? offset : 0}
      `, values);

    if (results && results.rows) {
      return results.rows.map(item => this.createInstance(item));
    }

    return Promise.resolve([]);
  }

  public static createInstance(row) {
    const instance = (new this()) as any;
    Object.keys(row).forEach(key => {
      instance.setAttribute(toCamelCase(key), row[key])
    });
    return instance;
  }
}