import {getService} from 'dok-ts';

export * from './PgService'

export function instance(instanceName: string) {
  return (target: any) => {
    target.$db = getService('PgService').getInstance(instanceName);
  }
}