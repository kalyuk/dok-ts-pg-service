import {BaseService} from 'dok-ts/base/BaseService';
import {Client} from 'pg';

export class PgService extends BaseService {
  public static options = {
    instances: {},
    pageSize: 20
  };

  private instances: { [key: string]: Client } = {};

  public init() {
    super.init();
    Object.keys(this.config.instances)
      .forEach((instanceName) => {
        this.instances[instanceName] = new Client(this.config.instances[instanceName]);
        this.instances[instanceName].connect();
      });
  }

  public getInstance(key: string) {
    return this.instances[key];
  }
}