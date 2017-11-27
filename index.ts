import {getService} from 'dok-ts';

export * from './PgService'

export function instance(instanceName: string) {
  return (target: any) => {
    const instance = getService('PgService').getInstance(instanceName);
    instance.addModels([target]);
  }
}