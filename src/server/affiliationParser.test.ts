import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractInstitutionFromRawAffiliations,
  getCountryGeoInfo,
  inferCountryCodeFromAffiliationString,
} from './affiliationParser';

test('getCountryGeoInfo resolves global ISO codes without collapsing to United States', () => {
  const libya = getCountryGeoInfo('LY');
  assert.equal(libya.country, 'Libya');
  assert.equal(libya.continent, 'Africa');

  const romania = getCountryGeoInfo('RO');
  assert.equal(romania.country, 'Romania');
  assert.equal(romania.continent, 'Europe');

  const taiwan = getCountryGeoInfo('TW');
  assert.equal(taiwan.country, 'Taiwan');
  assert.equal(taiwan.continent, 'Asia');
});

test('extractInstitutionFromRawAffiliations extracts institution and country from real OpenAlex raw strings', () => {
  const libyaInst = extractInstitutionFromRawAffiliations([
    'Electrical Department, Civil Aviation Higher Institute (CAHI), Alwatar, Tobruk 7502, Libya',
  ]);
  assert.ok(libyaInst);
  assert.equal(libyaInst.institutionName, 'Civil Aviation Higher Institute (CAHI)');
  assert.equal(libyaInst.countryCode, 'LY');

  const ukmInst = extractInstitutionFromRawAffiliations([
    'Centre for Integrated Systems Engineering and Advanced Technologies, FKAB, Universiti Kebagsaan Malaysia, Bangi, 43600, Malaysia',
  ]);
  assert.ok(ukmInst);
  assert.equal(ukmInst.institutionName, 'Universiti Kebangsaan Malaysia');
  assert.equal(ukmInst.countryCode, 'MY');

  const necInst = extractInstitutionFromRawAffiliations([
    'NEC Laboratories of America, Inc., Princeton, NJ, USA',
  ]);
  assert.ok(necInst);
  assert.equal(necInst.institutionName, 'NEC Laboratories of America');
  assert.equal(necInst.countryCode, 'US');

  const fairInst = extractInstitutionFromRawAffiliations(['Meta AI (FAIR)']);
  assert.ok(fairInst);
  assert.equal(fairInst.institutionName, 'Meta AI (FAIR)');
  assert.equal(fairInst.countryCode, '');

  const germanyInst = extractInstitutionFromRawAffiliations([
    'GMD FIRST, Rudower Chaussee 5, 12489, Berlin, Germany',
  ]);
  assert.ok(germanyInst);
  assert.equal(germanyInst.countryCode, 'DE');
});

test('inferCountryCodeFromAffiliationString prioritizes explicit OpenAlex country codes then affiliation text', () => {
  assert.equal(
    inferCountryCodeFromAffiliationString('Some Institute, Unknown City', ['JO']),
    'JO'
  );
  assert.equal(
    inferCountryCodeFromAffiliationString('AI for Science Institute, Beijing, China'),
    'CN'
  );
});
