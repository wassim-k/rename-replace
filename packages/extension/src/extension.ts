import { ExtensionContext, Uri, commands, workspace } from 'vscode';
import { Configuration } from './model/configuration';
import { MainPanel } from './panels/MainPanel';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand(
			'rename-replace.open',
			(selectedFile: Uri) => MainPanel.render(context.extensionPath, context.extensionUri, selectedFile, buildConfiguration()))
	);

	context.subscriptions.push(workspace.onDidChangeConfiguration(() => {
		MainPanel.currentPanel?.setConfiguration(buildConfiguration());
	}));
}

export function deactivate() { }

function buildConfiguration(): Configuration {
	const config = workspace.getConfiguration('rename-replace');
	const exclude = config.get<Array<string>>('exclude');
	return { exclude };
}
