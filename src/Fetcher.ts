import { ParsedUrlQueryInput } from 'querystring';
import querystring from 'querystring';
import moment from 'moment';
import { browserWindowId } from './BrowserWindowId';

type PreflightInput = {
  path: string;
  params: RequestInit;
};

export type XhrHooks = {
  input?: (input: PreflightInput) => PreflightInput;
  preSend?: (xhr: XMLHttpRequest) => void;
};

type PreflightMiddleware = (input: PreflightInput) => PreflightInput;
export type ProgressCallback = (e: ProgressEvent<XMLHttpRequestEventTarget>) => any;

export class Fetcher {
  defaultHeaders: Headers;
  on401: (retry: () => Promise<any>) => Promise<any>;
  preflight: PreflightMiddleware[] = [];

  constructor(options: { on401: (retry: () => Promise<any>) => Promise<any>; apiVersion?: string }) {
    this.on401 = options.on401;
    this.defaultHeaders = new Headers({
      accept: 'application/json',
      'X-BrowserWindowId': browserWindowId,
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

  getHeaders(add?: { [k: string]: string }) {
    if (!add || Object.keys(add).length === 0) return this.defaultHeaders;

    const hd = new Headers(this.defaultHeaders);
    for (let k in add) {
      hd.set(k, add[k]);
    }

    return hd;
  }

  async postFormData<T>(path: string, body: { [k: string]: string | Blob } | FormData, isRetry: boolean = false): Promise<T> {
    path = this.updatePath(path);

    let fd: FormData;
    if(body && body instanceof FormData) {
      fd = body;
    } else {
      fd = new FormData();
      for (let i in body) {
        fd.append(i, body[i]);
      }
    }

    const result = await this.fetch(path, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
      body: fd,
    });

    return this.handleFetchResponse<T>(result, () => this.postFormData(path, body, true), isRetry);
  }

  async fetchWithProgress<T>(
    method: 'POST' | 'PUT',
    path: string,
    body: BodyInit,
    onProgress: ProgressCallback,
    hooks?: XhrHooks,
  ) {
    path = this.updatePath(path);

    const result = await this.xhr(
      path,
      {
        method: method,
        headers: this.getHeaders(),
        credentials: 'include',
        cache: 'no-cache',
        redirect: 'follow',
        body: body,
      },
      onProgress,
      hooks,
    );

    return this.handleXhrResponse<T>(result);
  }

  async postFormDataWithProgress<T>(
    path: string,
    body: { [k: string]: string | Blob },
    onProgress: ProgressCallback,
    hooks: XhrHooks | null = null,
    isRetry: boolean = false,
  ): Promise<T> {
    path = this.updatePath(path);

    const fd = new FormData();
    for (var i in body) {
      fd.append(i, body[i]);
    }

    const result = await this.xhr(
      path,
      {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        cache: 'no-cache',
        redirect: 'follow',
        body: fd,
      },
      onProgress,
      hooks,
    );

    return this.handleXhrResponse<T>(
      result,
      () => this.postFormDataWithProgress(path, body, onProgress, hooks, true),
      isRetry,
    );
  }

  xhr(
    path: string,
    params: RequestInit,
    onProgress: (e: ProgressEvent<XMLHttpRequestEventTarget>) => any,
    hooks?: XhrHooks | null,
  ) {
    return new Promise<XMLHttpRequest>((resolve, reject) => {
      try {
        let input: PreflightInput = {
          path: path,
          params: params,
        };

        input = this.preflight.reduce((acc, item) => item(acc), input);
        if (hooks && hooks.input) {
          input = hooks.input(input);
        }

        let xhr = new XMLHttpRequest();
        xhr.open(input.params.method || 'GET', input.path, true);
        if (input.params.cache === 'no-cache') {
          xhr.setRequestHeader('Cache-Control', 'no-cache');
        }

        if (input.params.headers) {
          if (input.params.headers instanceof Array) {
            input.params.headers.map((pair) => xhr.setRequestHeader(pair[0], pair[1]));
          } else if ('forEach' in input.params.headers) {
            // @ts-ignore
            input.params.headers.forEach((value, key, parent) => {
              xhr.setRequestHeader(key, value);
            });
          } else {
            for (let key in input.params.headers) {
              if (input.params.headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, input.params.headers[key]);
              }
            }
          }
        }

        xhr.withCredentials = input.params.credentials !== 'omit';

        xhr.upload.addEventListener('progress', onProgress, false);
        xhr.addEventListener('abort', (e) => reject(e));
        xhr.addEventListener('error', (e) => reject(e));
        xhr.addEventListener('load', (e) => {
          if (xhr.readyState !== 4) return;

          let location: string | null = null;

          try {
            // ignore failures to get the Location header
            // sometimes this happens when it's blocked by CORS
            location = xhr.getResponseHeader('Location');
          } catch (e: any) {}

          if (location) {
            if (input.params.redirect === 'follow') {
              this.xhr(location, params, onProgress).then(resolve, reject);
              return;
            }

            if (input.params.redirect === 'error') {
              reject('Received redirect');
              return;
            }
          }

          resolve(xhr);
        });

        if (hooks && hooks.preSend) {
          hooks.preSend(xhr);
        }

        if (input.params.body) {
          xhr.send(input.params.body as any);
        } else {
          xhr.send();
        }
      } catch (e: any) {
        reject(e);
      }
    });
  }

  fetch(path: string, params: RequestInit) {
    let input: PreflightInput = {
      path: path,
      params: params,
    };

    input = this.preflight.reduce((acc, item) => item(acc), input);
    return fetch(input.path, input.params);
  }

  async postForAuth<T>(path: string, body: any): Promise<T> {
    path = this.updatePath(path);

    const result = await this.fetch(path, {
      method: 'POST',
      headers: this.getHeaders({
        'Content-Type': 'application/json',
      }),
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify(body),
    });

    return this.handleFetchResponse<T>(result);
  }

  async post<T>(path: string, body: any, isRetry: boolean = false): Promise<T> {
    path = this.updatePath(path);

    const result = await this.fetch(path, {
      method: 'POST',
      headers: this.getHeaders({
        'Content-Type': 'application/json',
      }),
      credentials: 'include',
      cache: 'no-cache',
      body: JSON.stringify(body),
    });

    return this.handleFetchResponse<T>(result, () => this.post(path, body, true), isRetry);
  }

  async put<T>(path: string, body: any, retry: boolean = false): Promise<T> {
    path = this.updatePath(path);

    const result = await this.fetch(path, {
      method: 'PUT',
      headers: this.getHeaders({
        'Content-Type': 'application/json',
      }),
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify(body),
    });

    return this.handleFetchResponse<T>(result, () => this.put(path, body, true), retry);
  }

  async get<T>(path: string, urlParameters?: ParsedUrlQueryInput, isRetry = false): Promise<T> {
    path = this.updatePath(path);

    let fullPath = path;
    if (urlParameters) {
      fullPath = path + '?' + querystring.stringify(urlParameters);
    }

    const result = await this.fetch(fullPath, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
    });

    return this.handleFetchResponse<T>(result, () => this.get(path, urlParameters, true), isRetry);
  }

  async handleXhrResponse<T>(xhr: XMLHttpRequest, retry?: () => Promise<T>, isRetry: boolean = false): Promise<T> {
    if (!isRetry && xhr.status === 401 && retry) {
      return this.on401(retry);
    }

    const contentType = xhr.getResponseHeader('Content-Type');

    const isNotJsonContentType = contentType && contentType.indexOf('json') === -1;
    const noContent = !contentType && !xhr.responseText;

    if (isNotJsonContentType || noContent) {
      if (xhr.status >= 400) {
        throw new FetcherError(xhr.status + ' ' + xhr.statusText, { xhr: xhr });
      }

      return xhr as any as T;
    }

    const jsonData = JSON.parse(xhr.responseText);

    if (jsonData && typeof jsonData === 'object' && 'error' in jsonData) {
      throw new Error(jsonData.error);
    }

    if (!this.isOkStatus(xhr.status)) {
      throw new Error(jsonData);
    }

    return jsonData as T;
  }

  isOkStatus(value: number) {
    return value < 400;
  }

  async handleFetchResponse<T>(result: Response, retry?: () => Promise<T>, isRetry: boolean = false): Promise<T> {
    if (!isRetry && result.status === 401 && retry) {
      return this.on401(retry);
    }

    const contentType = result.headers.get('Content-Type');
    if (contentType && contentType.indexOf('json') === -1) {
      if (result.status === 404) {
        throw new Error('Not found');
      }

      if (result.status >= 400) {
        throw new FetcherError(result.status + ' ' + result.statusText, { response: result });
      }

      return result as any as T;
    }

    const jsonData = await result.json();

    if (jsonData && typeof jsonData === 'object' && 'error' in jsonData) {
      throw new ErrorExt(jsonData.error, jsonData);
    }

    if (!result.ok) {
      throw new Error(jsonData);
    }

    return jsonData as T;
  }
}

export class ErrorExt extends Error {
  raw: any;

  constructor(msg: string, raw: any) {
    super(msg);
    this.raw = raw;
  }
}

type ExtraErrorInfo = { xhr?: XMLHttpRequest; response?: Response };

class FetcherError extends Error {
  info: ExtraErrorInfo;

  constructor(msg: string, info: ExtraErrorInfo) {
    super(msg);
    this.info = info;
  }
}

export interface ErrResponse {
  error: string;
}
