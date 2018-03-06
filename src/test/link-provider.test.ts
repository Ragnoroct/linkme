import * as assert from 'assert';
// import * as sinon from 'sinon';
import * as TypeMoq from "typemoq";
import * as vscode from 'vscode';
// import * as myExtension from '../extension';
import { Configuration } from '../configuration';
import { LinkProvider } from '../link-provider';
import { Rule } from '../rule';

function rangeToString(range: vscode.Range): string {
    return `(${range.start.line}, ${range.start.character}, ${range.end.line}, ${range.end.character})`;
}

function linkToString(link: vscode.DocumentLink): string {
    return `${rangeToString(link.range)} ${(link.target as vscode.Uri).toString(true)}`;
}

function expectedActualLinks(expected: vscode.DocumentLink, actual: vscode.DocumentLink): string {
    return `Expected: ${linkToString(expected)}\nActual: ${linkToString(actual)}`;
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('ragnoroct.linkme'));
    });

    test('Extension should activate', function () {
        this.timeout(1 * 60 * 1000);
        let extension = vscode.extensions.getExtension('ragnoroct.linkme') as vscode.Extension<any>;
        assert.notEqual(extension, undefined);
        return extension.activate()
            .then((api) => {
                assert.ok(true);
            });
    });

    test("Extension should provide document links with fieldsOnly false", () => {
        //Rules for the testing
        let rules = [
            new Rule("DEV-(\\d+)", "https://google.com/?search=\\1"),
            new Rule("BOB-(\\d{4})", "https://bob.com?id=\\1"),
            new Rule("LINKME:([^ $]*)", "https://linkme.com/?\\1")
        ];

        //Expected links from text
        let expectedLinks = [
            new vscode.DocumentLink(    //DEV-1324
                new vscode.Range(0, 0, 0, 8),
                vscode.Uri.parse("https://google.com/?search=1324")
            ),
            new vscode.DocumentLink(    //BOB-1234
                new vscode.Range(0, 9, 0, 17),
                vscode.Uri.parse("https://bob.com?id=1234")
            ),
            new vscode.DocumentLink(
                new vscode.Range(0, 18, 0, 26),
                vscode.Uri.parse("https://bob.com?id=1234")
            ),
            new vscode.DocumentLink(
                new vscode.Range(1, 23, 1, 31),
                vscode.Uri.parse("https://bob.com?id=4312")
            ),
            new vscode.DocumentLink(    //LINKME:search=querystring&other=bob
                new vscode.Range(1, 57, 1, 92),
                vscode.Uri.parse("https://linkme.com/?search=querystring&other=bob")
            ),
            new vscode.DocumentLink(    //LINKME:search=querystring&other=bobthistextisincluded
                new vscode.Range(2, 0, 2, 53),
                vscode.Uri.parse("https://linkme.com/?search=querystring&other=bobthistextisincluded")
            ),
        ];

        //Define the input text for testing
        let text = [
            "DEV-1324 BOB-1234 BOB-12345",
            "THISTEXTPREVENTSLINKAGEBOB-4312OTHERTEXTCONNECTEDSTOPSIT LINKME:search=querystring&other=bob",
            "LINKME:search=querystring&other=bobthistextisincluded but not this text because of spaces"
        ].join("\n");

        
        let configuration = new Configuration(false, rules);
        let linkProvider = new LinkProvider(() => configuration);
        let textDocumentMock = TypeMoq.Mock.ofType<vscode.TextDocument>();
        let tokenMock = TypeMoq.Mock.ofType<vscode.CancellationToken>();
        textDocumentMock.setup(x => x.getText()).returns(() => text);

        let links = linkProvider.provideDocumentLinks(textDocumentMock.object, tokenMock.object) as vscode.DocumentLink[];

        assert.equal(links.length, expectedLinks.length, "Expected links and actual links lengths are not equal.");
        for(let i: number = 0; i < links.length; i++) {
            let linkResult = links[i];
            let expectedLink = expectedLinks[i];
            
            if (linkResult.target !== undefined && expectedLink.target !== undefined) {
                assert.ok(linkResult.range.isEqual(expectedLink.range), `Ranges for links[${i}] are not equal.\n${expectedActualLinks(expectedLink, linkResult)}`);
                assert.equal(linkResult.target.toString(), expectedLink.target.toString(), `Urls for links[${i}] are not equal.\n${expectedActualLinks(expectedLink, linkResult)}`);
            } else {
                assert.ok(false, "One of the links is undefined.");
            }
        }
    });

    test("Extension should provide document links with fieldsOnly true", () => {
        //Rules for the testing
        let rules = [
            new Rule("DEV-(\\d+)", "https://google.com/?search=\\1"),
            new Rule("BOB-(\\d{4})", "https://bob.com?id=\\1"),
            new Rule("LINKME:(.*)", "https://linkme.com/?\\1")
        ];
        
        //Expected links from text
        let expectedLinks = [
            new vscode.DocumentLink(    //DEV-1324
                new vscode.Range(0, 0, 0, 8),
                vscode.Uri.parse("https://google.com/?search=1324")
            ),
            new vscode.DocumentLink(    //BOB-1234
                new vscode.Range(0, 9, 0, 17),
                vscode.Uri.parse("https://bob.com?id=1234")
            ),
            new vscode.DocumentLink(    //LINKME:search=querystring&other=bob
                new vscode.Range(1, 57, 1, 92),
                vscode.Uri.parse("https://linkme.com/?search=querystring&other=bob")
            ),
            new vscode.DocumentLink(    //LINKME:search=querystring&other=bobthistextisincluded
                new vscode.Range(2, 0, 2, 53),
                vscode.Uri.parse("https://linkme.com/?search=querystring&other=bobthistextisincluded")
            ),
        ];

        //Define the input text for testing
        let text = [
            "DEV-1324 BOB-1234 BOB-12345",
            "THISTEXTPREVENTSLINKAGEBOB-1234OTHERTEXTCONNECTEDSTOPSIT LINKME:search=querystring&other=bob",
            "LINKME:search=querystring&other=bobthistextisincluded but not this text because of spaces"
        ].join("\n");

        
        let configuration = new Configuration(true, rules);
        let linkProvider = new LinkProvider(() => configuration);
        let textDocumentMock = TypeMoq.Mock.ofType<vscode.TextDocument>();
        let tokenMock = TypeMoq.Mock.ofType<vscode.CancellationToken>();
        textDocumentMock.setup(x => x.getText()).returns(() => text);

        let links = linkProvider.provideDocumentLinks(textDocumentMock.object, tokenMock.object) as vscode.DocumentLink[];

        assert.equal(links.length, expectedLinks.length, "Expected links and actual links lengths are not equal.");
        for(let i: number = 0; i < links.length; i++) {
            let linkResult = links[i];
            let expectedLink = expectedLinks[i];
            
            if (linkResult.target !== undefined && expectedLink.target !== undefined) {
                assert.ok(linkResult.range.isEqual(expectedLink.range), `Ranges for links[${i}] are not equal.\n${expectedActualLinks(expectedLink, linkResult)}`);
                assert.equal(linkResult.target.toString(), expectedLink.target.toString(), `Urls for links[${i}] are not equal.\n${expectedActualLinks(expectedLink, linkResult)}`);
            } else {
                assert.ok(false, "One of the links is undefined.");
            }
        }
    });
});
