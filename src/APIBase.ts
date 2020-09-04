import { Fetcher } from './Fetcher';
import { EventEmitter } from './EventEmitter';

export class APIBase {
  fetcher: Fetcher;

  constructor(options?: APIBaseOptions) {
    this.fetcher = new Fetcher(async (retry: () => Promise<any>) => {
      if (options?.jwtRefreshEndpoint) {
        try {
          await this.fetcher.postForAuth(options.jwtRefreshEndpoint, {});
          return retry();
        } catch (e) {
          // continue to access-denied
        }
      }

      notAuthorizedResponse.emit(null);
      throw new Error('Access Denied');
    });
  }
}

export interface APIBaseOptions {
  jwtRefreshEndpoint: string;
}

export const notAuthorizedResponse = new EventEmitter();
