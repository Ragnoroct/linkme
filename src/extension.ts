'use strict';
import * as vscode from 'vscode';

import { LinkProvider } from './link-provider';
import { getConfiguration } from './configuration';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const linkProvider = new LinkProvider(getConfiguration);
    var disposable = vscode.languages.registerDocumentLinkProvider('*', linkProvider);

    context.subscriptions.push(disposable);
}