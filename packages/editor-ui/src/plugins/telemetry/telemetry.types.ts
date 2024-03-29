declare global {
	interface Window {
		rudderanalytics: RudderStack;
	}
}

export interface IUserNodesPanelSession {
	sessionId: string;
	data: IUserNodesPanelSessionData;
}

interface IUserNodesPanelSessionData {
	nodeFilter: string;
	resultsNodes: string[];
	filterMode: string;
}

/**
 * Simplified version of:
 * https://github.com/rudderlabs/rudder-sdk-js/blob/production-staging/packages/npm/index.d.ts
 */
export interface RudderStack {
	[key: string]: unknown;

	methods: string[];

	factory: (method: string) => (...args: unknown[]) => RudderStack;

	/**
	 * Native methods
	 */

	load(writeKey: string, dataPlaneUrl: string, options?: object): void;

	ready(): void;

	page(category?: string, name?: string, properties?: object, options?: object): void;

	track(event: string, properties?: object, options?: object): void;

	identify(id?: string, traits?: object, options?: object): void;

	alias(to: string, from?: string, options?: object): void;

	group(group: string, traits?: object, options?: object): void;

	getAnonymousId(): void;

	setAnonymousId(id?: string): void;

	reset(): void;
}

export {};
