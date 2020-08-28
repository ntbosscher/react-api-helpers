import { ParsedUrlQueryInput } from 'querystring';
import querystring from 'querystring';
import moment from 'moment';

export class Fetcher {
  defaultHeaders: Headers;
  on401: () => void;

  constructor(on401: () => void) {
    this.on401 = on401;
    this.defaultHeaders = new Headers({
      accept: 'application/json',
    });

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

  async postFormData<T>(path: string, body: { [k: string]: string | Blob }): Promise<T | ErrResponse> {
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

    return this.handleResponse<T>(result);
  }

  async post<T>(path: string, body: any): Promise<T | ErrResponse> {
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

  async put<T>(path: string, body: any): Promise<T | ErrResponse> {
    path = this.updatePath(path);

    const result = await fetch(path, {
      method: 'PUT',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(result);
  }

  async get<T>(path: string, urlParameters?: ParsedUrlQueryInput): Promise<T | ErrResponse> {
    path = this.updatePath(path);

    if (urlParameters) {
      path = path + '?' + querystring.stringify(urlParameters);
    }

    const result = await fetch(path, {
      method: 'GET',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-cache',
    });

    return this.handleResponse<T>(result);
  }

  async handleResponse<T>(result: Response): Promise<T | ErrResponse> {
    const contentType = result.headers.get('Content-Type');
    if (contentType && contentType.indexOf('json') === -1) {
      if (result.status === 404) {
        throw new Error('Not found');
      }
    }

    const jsonData = await result.json();

    if (result.status === 401) {
      this.on401();
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
