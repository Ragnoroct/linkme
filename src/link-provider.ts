import * as vscode from 'vscode';

import { getConfiguration } from './configuration';
import { Rule } from './rule';

export class LinkProvider implements vscode.DocumentLinkProvider {
    private get fieldsOnly(): boolean { 
        return getConfiguration().fieldsOnly;
    }
    private get rules(): Rule[] {
        return getConfiguration().rules;
    }
    
    public provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        return document.getText().split('\n')
            .reduce(
                (matches, line, no) => this.getMatchesOnLine(this.rules, line, no, this.fieldsOnly, matches),
                [] as vscode.DocumentLink[]
            );
    }

    private getMatchesOnLine(rules: Rule[], line: string, lineNo: number, fieldsOnly: boolean, matches: vscode.DocumentLink[]): vscode.DocumentLink[] {
        rules.forEach(rule => {
            const regexString = (fieldsOnly) ? `(?:^| )${rule.match}(?: |$)` : `${rule.match}`;
            const expr = new RegExp(regexString, 'gi');
            let match;
            while (true) {
                match = expr.exec(line);
                if (match === null) {
                    break;
                }

                //Set character index range for link
                var start = match.index;
                var end = match.index + match[0].length;
                //If captured spaces
                start = match[0].startsWith(" ") ? start + 1 : start;   
                end = match[0].endsWith(" ") ? end - 1 : end;
                const range = new vscode.Range(
                    new vscode.Position(lineNo, start),
                    new vscode.Position(lineNo, end)
                );

                //Form urlstring
                var url = rule.result;
                for (var i:number = 1; i < match.length; i++) {
                    url = url.replace(`\\${i}`, match[i]);
                }

                matches.push({
                    range,
                    target: vscode.Uri.parse(url)
                });
            }
        });
        return matches;
    }

}