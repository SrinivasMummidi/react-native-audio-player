const environment = ['dev-preview', 'development', 'staging', 'beta', 'live'] as const;

export type AppEnv = (typeof environment)[number];

export const getEnvironment = (appEnv?: AppEnv): AppEnv => {
	if (appEnv && environment.includes(appEnv)) return appEnv;
	return 'staging';
};

export const isEnvironment = (currentEnv?: AppEnv, env?: AppEnv): boolean => {
	return getEnvironment(currentEnv) === env;
};

export const isProduction = (appEnv?: AppEnv): boolean => {
	const env = getEnvironment(appEnv);
	return env === 'beta' || env === 'live';
};
