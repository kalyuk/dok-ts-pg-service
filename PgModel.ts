import {BaseModel} from 'dok-ts/base/BaseModel';
import {Client} from 'pg';

export class PgModel extends BaseModel {
  public $db: Client;

  public query(query, values) {
    return this.$db.query(query, values);
  }
}