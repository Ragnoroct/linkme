import * as assert from 'assert';
// import * as sinon from 'sinon';
import * as TypeMoq from "typemoq";
import * as vscode from 'vscode';
// import * as myExtension from '../extension';
import { Configuration } from '../configuration';
import { LinkProvider } from '../link-provider';
import { Rule } from '../rule';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // test('Extension should be present', () => {
    //     assert.ok(vscode.extensions.getExtension('ritwickdey.LiveServer'));
    // });

    // test('should activate', function () {
    //     this.timeout(1 * 60 * 1000);
    //     return vscode.extensions.getExtension('ritwickdey.LiveServer').activate()
    //         .then((api) => {
    //             assert.ok(true);
    //         });
    // });

    test("should provide document links", () => {
        //Rules for the testing
        let rules = [
            new Rule("DEV-(\\d+)", "https://google.com/?search=\\1"),
            new Rule("BOB-(\\d{4})", "https://bob.com?id=\\1"),
            new Rule("LINKME:(.*)", "https://linkme.com/?\\1")
        ];
        
        //Expected links from text
        let expectedLinks = [
            new vscode.DocumentLink(    //DEV-1324
                new vscode.Range(1, 0, 1, 8),
                vscode.Uri.parse("https://google.com/?search=1324")
            ),
            new vscode.DocumentLink(    //BOB-1234
                new vscode.Range(1, 9, 1, 17),
                vscode.Uri.parse("https://bob.com?id=1234")
            ),
            new vscode.DocumentLink(    //LINKME:search=querystring&other=bob
                new vscode.Range(2, 57, 2, 92),
                vscode.Uri.parse("https://linkme.com/?search=querystring&other=bob")
            ),
            new vscode.DocumentLink(    //LINKME:search=querystring&other=bobthistextisincluded
                new vscode.Range(3, 0, 3, 53),
                vscode.Uri.parse("https://linkme.com/?search=querystring&other=bobthistextisincluded")
            ),
        ];

        //Define the input text for testing
        let text = 
`
DEV-1324 BOB-1234 BOB-12345
THISTEXTPREVENTSLINKAGEBOB-1234OTHERTEXTCONNECTEDSTOPSIT LINKME:search=querystring&other=bob
LINKME:search=querystring&other=bobthistextisincluded but not this text because of spaces
`;

        
        let configuration = new Configuration(true, rules);
        let linkProvider = new LinkProvider(configuration);
        let textDocumentMock = TypeMoq.Mock.ofType<vscode.TextDocument>();
        let tokenMock = TypeMoq.Mock.ofType<vscode.CancellationToken>();
        textDocumentMock.setup(x => x.getText()).returns(() => text);

        let links = linkProvider.provideDocumentLinks(textDocumentMock.object, tokenMock.object) as vscode.DocumentLink[];

        assert.equal(links.length, expectedLinks.length, "Expected links and actual links lengths are not equal.");
        for(let i: number = 0; i < links.length; i++) {
            let linkResult = links[i];
            let expectedLink = expectedLinks[i];
            
            if (linkResult.target !== undefined && expectedLink.target !== undefined) {
                assert.ok(linkResult.range.isEqual(expectedLink.range), `Ranges for links[${i}] are not equal.`);
                assert.equal(linkResult.target.toString(), expectedLink.target.toString(), `Urls for links[${i}] are not equal.`);
            } else {
                assert.ok(false, "One of the links is undefined.");
            }
        }
    });
});
