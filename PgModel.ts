import {BaseModel} from 'dok-ts/base/BaseModel';
import {Client} from 'pg';
import {toCamelCase, toUnder} from './helper';
import {BaseError} from 'dok-ts/base/BaseError';

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

    if (data) {
      const instance = (new this()) as any;
      Object.keys(data.rows[0]).forEach(key => {
        instance.setAttribute(toCamelCase(key), data.rows[0][key])
      });
      return instance;
    }

    return null;
  }

  public async beforeSave() {

  }

  public async beforeCreate() {

  }

  public async beforeUpdate() {

  }

  public async afterSave() {

  }

  public async afterCreate() {

  }

  public async afterUpdate() {

  }

  public async save() {
    if (await this.validate()) {
      if (this.id) {
        await this.beforeUpdate();
      } else {
        await this.beforeCreate();
      }
      await this.beforeSave();

      if (this.id) {
        await this.update()
      } else {
        await this.create();
      }
      await this.afterSave();
    } else {
      throw new BaseError(409, 'model.invalid_date')
    }

  }

  private async update() {
    await this.afterUpdate();
  }

  private async create() {
    const attributes = [];
    const indexes = [];
    const values = [];

    const {$db, $tableName} = this.constructor as any;

    this.attributes()
      .forEach((attr, index) => {
        if (this[attr]) {
          attributes.push(toUnder(attr));
          indexes.push(`$${index}`);
          values.push(this[attr]);
        }
      });

    const item = await $db.query('INSERT INTO ' + $tableName + '(' + attributes.join(',') + ') ' +
      'VALUES(' + indexes.join(',') + ') RETURNING id', values);

    this.id = item.rows[0].id;

    await this.afterCreate();
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