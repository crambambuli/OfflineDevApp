import { Injectable } from '@angular/core';
import { AGE_STORE, dbPromise } from '../../service-worker/idb-config';
import { AgeStruct } from '../../service-worker/age-struct';

@Injectable({
  providedIn: 'root'
})
export class ExportImportService {

  async importAgeStore() {
    try {
      const [handler] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Json files',
            accept: {
              'application/json': ['.json']
            }
          }
        ]
      });

      const file = await handler.getFile();
      const appDataText = await file.text();

      const ageStructs = <AgeStruct[]>JSON.parse(appDataText);

      console.log('Importiere idb-Anwendungsdaten/JSON', ageStructs);

      const db = await dbPromise;
      await db.clear(AGE_STORE);
      const tx = db.transaction(AGE_STORE, 'readwrite')
      const store = tx.store;

      for (const ageStruct of ageStructs) {
        await store.put(ageStruct);
      }

      tx.done;

    } catch (e) {
      console.error(e);
    }
  }

  async saveAgeStoreAs() {
    try {
      const handler = await window.showSaveFilePicker({
        types: [
          {
            description: 'Json file',
            accept: {
              'application/json': ['.json']
            }
          }
        ],
        suggestedName: 'offline-application-data'
      });

      await this.saveAgeStore(handler);
    } catch (e) {
      console.error(e);
    }
  }

  private async saveAgeStore(handler: FileSystemFileHandle) {
    try {
      const writable = await handler.createWritable();

      const db = await dbPromise;
      const tx = db.transaction(AGE_STORE, 'readonly')
      const store = tx.store;

      const ageStructs = await store.getAll();

      console.log('Exportiere idb-Anwendungsdaten/JSON', ageStructs);

      await writable.write(JSON.stringify(ageStructs));

      tx.done;

      await writable.close();
    } catch (e) {
      console.error(e);
    }
  }
}
