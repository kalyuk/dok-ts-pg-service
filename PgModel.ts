import { BaseModel } from 'dok-ts/base/BaseModel';
import { Client } from 'pg';
import { toCamelCase, toUnder } from './helper';
import { getService } from 'dok-ts';

export interface FindOneInterface {
  attributes?: string[];
  where: string
}

export interface FindInterface extends FindOneInterface {
  attributes?: string[];
  where: string
  pageSize?: number;
  page?: number;
  sort?: string[];
}

export class PgModel extends BaseModel {
  public id: number = null;
  public static $tableName;
  public static $db: Client;

  public static query(query, values?) {
    return this.$db.query(query, values || []);
  }

  public static async find<T>({attributes, where}: FindInterface, values = []): Promise<T> {
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

  public static async findAll<T>({attributes, where, page, pageSize, sort}: FindInterface, values = []): Promise<T[]> {
    const $page = page ? page : 1;
    const $pageSize = pageSize ? pageSize : getService('PgService').config.pageSize;
    const offset = ($page - 1) * $pageSize;
    const results = await this.query(`
    SELECT
    ${attributes ? attributes.join(',') : '*'}
    FROM
    ${this.$tableName}
    ${where ? 'WHERE ' + where : ''}
    ${sort ? 'order by ' + sort.join(', ') : ''}
    LIMIT ${$pageSize}
    OFFSET ${offset}`,
      values);

    if (results && results.rows) {
      return results.rows.map(item => this.createInstance(item));
    }

    return [];
  }

  public static async findAllAndCount<T>(params: FindInterface, values = []): Promise<{items: T[], count: number}> {
    const items = await this.findAll<T>(params, values);
    const count = await this.count(params.where, values);

    return {
      items,
      count
    }
  }

  public static async count(where, values = []): Promise<number> {
    const results = await this.query(`
    SELECT
    COUNT(id)
    FROM
    ${this.$tableName}
    ${where ? 'WHERE ' + where : ''}`,
      values);

    if (results.rows.length) {
      return results.rows[0].count;
    }

    return 0
  }

  public static createInstance(row) {
    const instance = (new this()) as any;
    Object.keys(row).forEach(key => {
      instance.setAttribute(toCamelCase(key), row[key])
    });
    return instance;
  }
}