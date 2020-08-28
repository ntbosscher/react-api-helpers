import { Fetcher } from './Fetcher';
import { EventEmitter } from './EventEmitter';

export class APIBase {
  fetcher: Fetcher;

  constructor() {
    this.fetcher = new Fetcher(() => notAuthorizedResponse.emit(null));
  }
}

export const notAuthorizedResponse = new EventEmitter();
