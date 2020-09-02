import { Fetcher } from './Fetcher';
import { EventEmitter } from './EventEmitter';

export class APIBase {
  fetcher: Fetcher;

  constructor(options?: APIBaseOptions) {
    this.fetcher = new Fetcher(async (retry: () => Promise<any>) => {

      if(options?.jwtRefreshEndpoint) {
        await this.fetcher.post(options.jwtRefreshEndpoint, {});
        return retry();
      }

      notAuthorizedResponse.emit(null);
      throw new Error("Access Denied");
    });
  }
}

export interface APIBaseOptions {jwtRefreshEndpoint: string}

export const notAuthorizedResponse = new EventEmitter();
