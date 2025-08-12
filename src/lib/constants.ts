export const INSIGHTS_URL_STAGING = 'https://backend.staging.switchport.app/api/v1/call/insights';
export const INSIGHTS_URL_LIVE = 'https://backend.switchport.app/api/v1/call/insights';

export const BRANDIDS = {
  ANSWER_CONNECT: '5a6e67a6-8bfd-45f5-a774-3462cb0c4e4c',
  ANSWER_CONNECT_UK: 'b2f8613c-0d56-40ae-a41d-55aceca62e86',
  ANSWER_CONNECT_CA: 'a6f26167-e9af-45b3-b73c-f9a9f04658ec',
  ANSWER_FORCE: 'c26495e9-f41e-4b8d-a442-22ab742563b7',
  ANSWER_FORCE_UK: 'fd335ead-dac3-4ce1-8908-badaae9c0aa0',
  ANSWER_FORCE_CA: '014fc01c-2cfb-4a90-a15c-c70c07374cce',
  LEX_RECEPTION: 'b80d69bd-c236-4aff-82d8-1675f087c8d7',
  LEX_RECEPTION_UK: 'b9a73179-8e11-4022-8684-e5fb220744ca',
  LEX_RECEPTION_CA: '5f472e89-7ebd-44a4-9169-82c5428c9549',
  SERVICE_FORGE: 'd1f07baa-a57c-474b-8577-56502de6d182',
  HELLO_SELLS: '12069e64-bd54-4ba9-97f7-249f62cc8178',
  WELL_RECEIVED: '9c01c4a2-e055-4342-8589-2e5bd632524c',
  SIGN_MORE: 'f6617466-07aa-4ad8-b109-0a8119362962',
  LISTERPLACE: 'c60997ca-b02b-45be-85a0-1956d92de1e2',
  SETMORE: '110003eb-76c1-4b81-a96a-4cdf91bf70fb',
} as const;

export const INBOUND_BASE_URLS_LIVE: Record<string, string> = {
  [BRANDIDS.ANSWER_CONNECT]: 'https://api.answerconnect.app',
  [BRANDIDS.ANSWER_CONNECT_UK]: 'https://api.answerconnect.app',
  [BRANDIDS.ANSWER_CONNECT_CA]: 'https://api.answerconnect.app',
  [BRANDIDS.ANSWER_FORCE]: 'https://api.answerforce.app',
  [BRANDIDS.ANSWER_FORCE_CA]: 'https://api.answerforce.app',
  [BRANDIDS.ANSWER_FORCE_UK]: 'https://api.answerforce.app',
  [BRANDIDS.LEX_RECEPTION]: 'https://api.lexreception.app',
  [BRANDIDS.LEX_RECEPTION_UK]: 'https://api.lexreception.app',
  [BRANDIDS.LEX_RECEPTION_CA]: 'https://api.lexreception.app',
  [BRANDIDS.WELL_RECEIVED]: 'https://api.wellreceived.app',
  [BRANDIDS.HELLO_SELLS]: 'https://api.hellosells.app',
  [BRANDIDS.SERVICE_FORGE]: 'https://api.serviceforge.app',
  [BRANDIDS.SIGN_MORE]: 'https://api.signmore.app',
  [BRANDIDS.LISTERPLACE]: 'https://api.listerplace.app',
  [BRANDIDS.SETMORE]: 'https://bc-api.setmore.com',
};

export const INBOUND_BASE_URLS_STAGING: Record<string, string> = {
  [BRANDIDS.ANSWER_CONNECT]: 'https://api.staging.answerconnect.app',
  [BRANDIDS.ANSWER_CONNECT_UK]: 'https://api.staging.answerconnect.app',
  [BRANDIDS.ANSWER_CONNECT_CA]: 'https://api.staging.answerconnect.app',
  [BRANDIDS.ANSWER_FORCE]: 'https://api.staging.answerforce.app',
  [BRANDIDS.ANSWER_FORCE_CA]: 'https://api.staging.answerforce.app',
  [BRANDIDS.ANSWER_FORCE_UK]: 'https://api.staging.answerforce.app',
  [BRANDIDS.LEX_RECEPTION]: 'https://api.staging.lexreception.app',
  [BRANDIDS.LEX_RECEPTION_UK]: 'https://api.staging.lexreception.app',
  [BRANDIDS.LEX_RECEPTION_CA]: 'https://api.staging.lexreception.app',
  [BRANDIDS.WELL_RECEIVED]: 'https://api.staging.wellreceived.app',
  [BRANDIDS.HELLO_SELLS]: 'https://api.staging.hellosells.app',
  [BRANDIDS.SERVICE_FORGE]: 'https://api.staging.serviceforge.app',
  [BRANDIDS.SIGN_MORE]: 'https://api.staging.signmore.app',
  [BRANDIDS.LISTERPLACE]: 'https://api.staging.listerplace.app',
  [BRANDIDS.SETMORE]: 'https://bc-api.staging.setmore.com',
};

export type AppEnv = 'development' | 'staging' | 'production' | 'dev-preview';
