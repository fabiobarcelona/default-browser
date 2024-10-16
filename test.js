import test from 'ava';
import windows, {UnknownBrowserError} from './windows.js';
import defaultBrowser from './index.js';

test('sane', async t => {
	const {id} = await defaultBrowser();
	console.log('Default browser', id);
	t.regex(id, /^(com|org)\./);
});

test('windows parsing', async t => {
	const cases = [
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    AppXq0fevzme2pys62n3e0fbqa7peapykr8v\r\n\r\n',
			expected: 'com.microsoft.edge.old',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    MSEdgeDHTML\r\n\r\n',
			expected: 'com.microsoft.edge',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    ChromeHTML\r\n\r\n',
			expected: 'com.google.chrome',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    IE.HTTP\r\n\r\n',
			expected: 'com.microsoft.ie',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    FirefoxURL\r\n\r\n',
			expected: 'org.mozilla.firefox',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    BraveHTML\r\n\r\n',
			expected: 'com.brave.Browser',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    BraveSSHTM\r\n\r\n',
			expected: 'com.brave.Browser.nightly',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    BraveBHTML\r\n\r\n',
			expected: 'com.brave.Browser.beta',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    Opera GXStable\r\n\r\n',
			expected: 'com.opera.gx',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    OperaStable\r\n\r\n',
			expected: 'com.opera.Opera',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    OperaNext\r\n\r\n',
			expected: 'com.operasoftware.operanext',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    OperaDeveloper\r\n\r\n',
			expected: 'com.operasoftware.operadeveloper',
		},
		{
			output: '\r\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice\r\n    ProgId    REG_SZ    Potato\r\n\r\n',
			expected: undefined,
		},
		{
			output:
				'',
			expected: undefined,
		},
	];

	await Promise.all(cases.map(async testCase => {
		let actual;
		try {
			actual = await windows(async () => ({stdout: testCase.output}));
		} catch (error) {
			if (!(error instanceof UnknownBrowserError)) {
				throw error;
			}
		}

		t.is(actual && actual.id, testCase.expected);
	}));
});
