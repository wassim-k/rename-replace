import fs from 'fs';
import path from 'path';
import { generateReplacements, renameReplace } from 'rename-replace';
import { Disposable, Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode';
import { Configuration } from '../model/configuration';
import { getNonce } from '../utilities/getNonce';
import { getReport } from '../utilities/getReport';
import { getUri } from '../utilities/getUri';

export class MainPanel {
  public static currentPanel: MainPanel | undefined;
  private readonly panel: WebviewPanel;
  private readonly disposables: Array<Disposable> = [];
  private readonly extensionUri: Uri;
  private configuration: Configuration;
  private currentPath: string;

  private constructor(panel: WebviewPanel, extensionUri: Uri, selectedFile: Uri, configuration: Configuration) {
    this.panel = panel;
    this.currentPath = selectedFile.fsPath;
    this.extensionUri = extensionUri;
    this.configuration = configuration;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.html = this.getWebviewContent(this.panel.webview);

    this.setWebviewMessageListener(this.panel.webview);
  }

  public static render(extensionPath: string, extensionUri: Uri, selectedFile: Uri, configuration: Configuration) {
    if (MainPanel.currentPanel) {
      MainPanel.currentPanel.panel.reveal(ViewColumn.One);
      MainPanel.currentPanel.setConfiguration(configuration);
      MainPanel.currentPanel.setPath(selectedFile.fsPath);
    } else {
      const panel = window.createWebviewPanel(
        'rename-replace.main',
        'Rename / Replace',
        ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            Uri.joinPath(extensionUri, 'dist'),
            Uri.joinPath(extensionUri, 'webview-ui/dist')
          ]
        }
      );

      panel.iconPath = Uri.file(path.join(extensionPath, 'images', 'icon.png'));

      MainPanel.currentPanel = new MainPanel(panel, extensionUri, selectedFile, configuration);
    }
  }

  public setConfiguration(configuration: Configuration) {
    this.configuration = configuration;
  }

  public setPath(fsPath: string) {
    this.currentPath = fsPath;
    this.panel.webview.html = this.getWebviewContent(this.panel.webview);
  }

  public dispose() {
    MainPanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private getWebviewContent(webview: Webview) {
    const stylesUri = getUri(webview, this.extensionUri, ['webview-ui', 'dist', 'styles.css']);
    const runtimeUri = getUri(webview, this.extensionUri, ['webview-ui', 'dist', 'runtime.js']);
    const polyfillsUri = getUri(webview, this.extensionUri, ['webview-ui', 'dist', 'polyfills.js']);
    const scriptUri = getUri(webview, this.extensionUri, ['webview-ui', 'dist', 'main.js']);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Rename / Replace</title>
        </head>
        <body>
          <script type="module" nonce="${nonce}">
            window.currentPath = '${this.currentPath.replaceAll('\\', '\\\\')}';
            window.currentPathType = '${fs.statSync(this.currentPath).isDirectory() ? 'folder' : 'file'}';
            window.currentPathBaseName = '${path.basename(this.currentPath)}';
          </script>
          <app-root></app-root>
          <script type="module" nonce="${nonce}" src="${runtimeUri}"></script>
          <script type="module" nonce="${nonce}" src="${polyfillsUri}"></script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      async (message: any) => {
        const command = message.command;

        if (command === 'renameReplace') {
          const options = message.options;
          const { from, to, casing, ...rest } = options;
          const { exclude } = this.configuration;
          try {
            const replacements = generateReplacements(options.from, options.to, options.casing);
            const paths = await renameReplace(this.currentPath, replacements, { ...rest, exclude });
            window.showInformationMessage(getReport(paths));
          } catch (error: any) {
            const message = typeof error === 'string'
              ? error
              : error instanceof Error
                ? error.message
                : 'An error has occurred';
            window.showErrorMessage(message);
          } finally {
            this.dispose();
          }
        }
      },
      undefined,
      this.disposables
    );
  }
}
