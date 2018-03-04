'use strict';
import * as vscode from 'vscode';

import { LinkProvider } from './link-provider';
import { getConfiguration } from './configuration';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const linkProvider = new LinkProvider(getConfiguration());
    vscode.languages.registerDocumentLinkProvider('*', linkProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {

}