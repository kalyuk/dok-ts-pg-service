import {BaseService} from 'dok-ts/base/BaseService';
import {Client} from 'pg';

export class PgService extends BaseService {
  public static options = {
    instances: {}
  };

  private instances: { [key: string]: Client } = {};

  public init() {
    super.init();
    Object.keys(this.config.instances)
      .forEach((instanceName) => {
        this.instances[instanceName] = new Client(this.config.instances[instanceName]);
      });
  }

  public getInstance(key: string) {
    return this.instances[key];
  }
}