import { digitString, genString } from './utils';

const host = 'api.cloudflareclient.com'
const cloudFlareApiBaseUrl = new URL(`https://${host}`);

export async function callCloudFlareApi(referrer_id: string) {
  if (referrer_id.length < 30) {
    throw new Error('Client ID is not valid');
  }
  const install_id = genString(22);
  const url = new URL(`/v0a${digitString(3)}/reg`, cloudFlareApiBaseUrl);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Host: host,
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'okhttp/3.12.1',
    },
    body: JSON.stringify({
      key: genString(43) + '=',
      install_id: install_id,
      fcm_token: `${install_id}:APA91b${genString(134)}`,
      referrer: referrer_id,
      warp_enabled: false,
      tos: new Date().toISOString().slice(0, -5) + '+02:00',
      type: 'Android',
      locale: 'es_ES',
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to call CloudFlare API: ${response.status}`);
  }
  return response;
}
