export class Rule {
    match: string;
    result: string;

    constructor(match: string, result: string) {
        this.match = match;
        this.result = result;
    } 
}