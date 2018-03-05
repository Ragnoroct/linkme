export class Rule {
    regex: string;
    url: string;

    constructor(regex: string, url: string) {
        this.regex = regex;
        this.url = url;
    } 
}