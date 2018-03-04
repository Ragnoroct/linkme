import * as vscode from 'vscode';

import { Configuration } from './configuration';
import { Rule } from './rule';

class Field {
    value: string;
    pos: number;
    constructor(value: string, pos: number) {
        this.value = value;
        this.pos = pos;
    }
}

export class LinkProvider implements vscode.DocumentLinkProvider {
    private get fieldsOnly(): boolean { 
        return this.configuration.fieldsOnly;
    }
    
    private get rules(): Rule[] {
        return this.configuration.rules;
    }

    configuration: Configuration;

    public constructor(configuration: Configuration) {
        this.configuration = configuration;
    }
    
    public provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        return document.getText().split('\n')
            .reduce(
                (matches, line, lineNumber) => this.getMatchesOnLine(this.rules, line, lineNumber, this.fieldsOnly, matches),
                [] as vscode.DocumentLink[]
            );
    }

    private getMatchesOnLine(rules: Rule[], line: string, lineNo: number, fieldsOnly: boolean, matches: vscode.DocumentLink[]): vscode.DocumentLink[] {
        var fields:Field[];

        if (fieldsOnly) {
            var searchPos = 0;
            var fieldValues = line.match(/[^ ]+/g) || [];
            fields = fieldValues.map(value => {
                var pos = line.indexOf(value, searchPos);
                searchPos = pos + value.length;
                return new Field(value, pos);
            });
        } else {
            fields = [ new Field(line, 0) ];
        }
        
        rules.forEach(rule => {
            const regexString = rule.match;
            const expr = new RegExp(regexString, 'gi');
            fields.forEach(field => {
                let match;
                while(true) {
                    match = expr.exec(field.value);
                    if (match === null) {
                        break;
                    }
                    if (match !== null) {
                        //Set character index range for link
                        var start = field.pos + match.index;
                        var end = field.pos + match.index + match[0].length;

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
                }
            });
        });
        return matches;
    }

}