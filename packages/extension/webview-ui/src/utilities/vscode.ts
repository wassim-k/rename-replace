import type { WebviewApi } from 'vscode-webview';

export type Disposable = () => void;

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  public constructor() {
    if (typeof acquireVsCodeApi === 'function') {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  public postMessage(message: unknown) {
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    } else {
      console.log(message);
    }
  }

  public onReceiveMessage<T>(handle: (data: T) => void): Disposable {
    const listener = (event: MessageEvent<T>) => handle(event.data);
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }
}

export const vscode = new VSCodeAPIWrapper();
