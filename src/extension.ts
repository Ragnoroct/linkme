'use strict';
import * as vscode from 'vscode';

import { LinkProvider } from './link-provider';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const linkProvider = new LinkProvider();
    vscode.languages.registerDocumentLinkProvider('*', linkProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {

}