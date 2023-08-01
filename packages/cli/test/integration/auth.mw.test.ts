import type { SuperAgentTest } from 'supertest';
import * as testDb from './shared/testDb';
import * as utils from './shared/utils';
import config from '@/config';

describe('Auth Middleware', () => {
	const testServer = utils.setupTestServer({ endpointGroups: ['me', 'auth', 'owner', 'users'] });

	/** Routes requiring a valid `n8n-auth` cookie for a user, either owner or member. */
	const ROUTES_REQUIRING_AUTHENTICATION: Readonly<Array<[string, string]>> = [
		['PATCH', '/me'],
		['PATCH', '/me/password'],
		['POST', '/me/survey'],
		['POST', '/owner/setup'],
		['GET', '/non-existent'],
	];

	authlessAgent = utils.createAgent(app);
	authMemberAgent = utils.createAuthAgent(app)(member);

	config.set('userManagement.isInstanceOwnerSetUp', true);
});

	describe('Routes requiring Authentication', () => {
		ROUTES_REQUIRING_AUTHENTICATION.concat(ROUTES_REQUIRING_AUTHORIZATION).forEach(
			([method, endpoint]) => {
				test(`${method} ${endpoint} should return 401 Unauthorized if no cookie`, async () => {
					const { statusCode } = await testServer.authlessAgent[method.toLowerCase()](endpoint);
					expect(statusCode).toBe(401);
				});
			},
		);
	});

	describe('Routes requiring Authorization', () => {
		let authMemberAgent: SuperAgentTest;
		beforeAll(async () => {
			const globalMemberRole = await testDb.getGlobalMemberRole();
			const member = await testDb.createUser({ globalRole: globalMemberRole });
			authMemberAgent = testServer.authAgentFor(member);
		});

		ROUTES_REQUIRING_AUTHORIZATION.forEach(async ([method, endpoint]) => {
			test(`${method} ${endpoint} should return 403 Forbidden for member`, async () => {
				const { statusCode } = await authMemberAgent[method.toLowerCase()](endpoint);
				expect(statusCode).toBe(403);
			});
		});
	});
});
