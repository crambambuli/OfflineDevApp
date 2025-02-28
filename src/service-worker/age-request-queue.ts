// import { AgeStruct } from './age-struct';
// import { AGE_STORE, dbPromise } from './idb-config';

export class AgeRequestQueue {
  private requests = <Request[]>[];

  enqueue(request: Request) {
    this.requests.push(request);
  }

  async processRequests() {
    console.log(`###AgeRequestQueue: process (try to fetch) ${this.requests.length} request(s)`);

    while (this.requests.length > 0) {
      const request = this.requests[0];

      try {
        // Sende Clone, um Request wiederverwenden zu können, falls fetch fehlschlägt.
        const fetchRequest = request.clone();
        console.log('###AgeRequestQueue: fetch', fetchRequest, 'body=', await fetchRequest.clone().text());
        const fetchResponse = await fetch(fetchRequest);

        const responseBody = await fetchResponse.text();
        console.log('###AgeRequestQueue: fetchResponse=', fetchResponse, 'body=', responseBody);

        /*
        // Ggf. update idb (erneut) (???)
        if (fetchResponse.status === 201) {
          const ageEntryFromFetch = <AgeStruct>JSON.parse(responseBody);
          await (await dbPromise).put(AGE_STORE, ageEntryFromFetch);
        }
        */

        this.requests.shift(); // dequeue

      } catch (error) { // Offline
        console.warn('###AgeRequestQueue: cannot fetch (still offline)', error);
        break;
      }
    }
  }

  empty(): boolean {
    return this.requests.length === 0;
  }
}

export const requestQueue = new AgeRequestQueue();
