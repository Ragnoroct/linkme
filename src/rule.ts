export class Rule {
    pattern: string;
    url: string;

    constructor(pattern: string, url: string) {
        this.pattern = pattern;
        this.url = url;
    } 
}