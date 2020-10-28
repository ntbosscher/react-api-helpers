import { ParsedUrlQueryInput } from 'querystring';
import querystring from 'querystring';
import moment from 'moment';

export class Fetcher {
  defaultHeaders: Headers;
  on401: (retry: () => Promise<any>) => Promise<any>;

  constructor(options: { on401: (retry: () => Promise<any>) => Promise<any>; apiVersion?: string }) {
    this.on401 = options.on401;
    this.defaultHeaders = new Headers({
      accept: 'application/json',
    });

    if (options.apiVersion) {
      this.defaultHeaders.append('X-APIVersion', options.apiVersion);
    }

    this.defaultHeaders.append('X-TimezoneOffsetMins', moment().utcOffset().toString());
  }

  updatePath(path: string): string {
    return path;
  }

  download(method: 'GET', path: string, urlParameters?: ParsedUrlQueryInput) {
    path = this.updatePath(path);
    if (urlParameters) {
      path = path + '?' + querystring.stringify(urlParameters);
    }

    // @ts-ignore
    window.location = path;
  }

  async postFormData<T>(path: string, body: { [k: string]: string | Blob }, isRetry: boolean = false): Promise<T> {
    path = this.updatePath(path);

    const fd = new FormData();
    for (var i in body) {
      fd.append(i, body[i]);
    }

    const result = await fetch(path, {
      method: 'POST',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
      body: fd,
    });

    return this.handleResponse<T>(result, () => this.postFormData(path, body, true), isRetry);
  }

  async postForAuth<T>(path: string, body: any): Promise<T> {
    path = this.updatePath(path);

    const result = await fetch(path, {
      method: 'POST',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(result);
  }

  async post<T>(path: string, body: any, isRetry: boolean = false): Promise<T> {
    path = this.updatePath(path);

    const result = await fetch(path, {
      method: 'POST',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(result, () => this.post(path, body, true), isRetry);
  }

  async put<T>(path: string, body: any, retry: boolean = false): Promise<T> {
    path = this.updatePath(path);

    const result = await fetch(path, {
      method: 'PUT',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(result, () => this.put(path, body, true), retry);
  }

  async get<T>(path: string, urlParameters?: ParsedUrlQueryInput, isRetry = false): Promise<T> {
    path = this.updatePath(path);

    let fullPath = path;
    if (urlParameters) {
      fullPath = path + '?' + querystring.stringify(urlParameters);
    }

    const result = await fetch(fullPath, {
      method: 'GET',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
    });

    return this.handleResponse<T>(result, () => this.get(path, urlParameters, true), isRetry);
  }

  async handleResponse<T>(result: Response, retry?: () => Promise<T>, isRetry: boolean = false): Promise<T> {
    const contentType = result.headers.get('Content-Type');
    if (contentType && contentType.indexOf('json') === -1) {
      if (result.status === 404) {
        throw new Error('Not found');
      }
    }

    const jsonData = await result.json();

    if (!isRetry && result.status === 401 && retry) {
      return this.on401(retry);
    }

    if (jsonData && typeof jsonData === 'object' && 'error' in jsonData) {
      throw new Error(jsonData.error);
    }

    if (!result.ok) {
      throw new Error(jsonData);
    }

    return jsonData as T;
  }
}

export interface ErrResponse {
  error: string;
}
