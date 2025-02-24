import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { AGIFY_STORE, dbPromise } from '../../service-worker/idb-config';
import { AgifyStruct } from '../../service-worker/agify-struct';

@Injectable({
  providedIn: 'root'
})
export class ExportImportService {

  private db: IDBPDatabase;
  private handler: FileSystemFileHandle;

  constructor() {
    this.db = null;

    // Get the database and current open file handler
    openDB('settings-store').then(async (db) => {
      this.db = db;
      const file = await db.get('settings', 'handler');

      if (file) {
        document.title = `${file.name} | Offline-Anwendungsdaten`;
        this.handler = file;
      }
    });

    // Close the preview window when this window closes
    window.addEventListener('beforeunload', () => {
      // ...
    });
  }

  /**
   * Function to call when the open button is triggered
   */
  async open() {
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

      document.title = `${handler.name} | Offline-Anwendungsdaten`;

      const file = await handler.getFile();
      const appDataText = await file.text();

      const agifyStructs = <AgifyStruct[]>JSON.parse(appDataText);

      console.log('Importiere idb-Anwendungsdaten/JSON', agifyStructs);

      const db = await dbPromise;
      await db.clear(AGIFY_STORE);

      const tx = db.transaction(AGIFY_STORE, 'readwrite')
      const store = tx.store;

      for (const agifyStruct of agifyStructs) {
        await store.add(agifyStruct, agifyStruct.name);
      }

      tx.done;

      this.handler = handler;

      await this.db.put('settings', handler, 'handler');

    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Function to call when the save button is triggered
   */
  async save() {
    const handler = this.handler || (await this.db.get('settings', 'handler'));

    if (!handler) {
      await this.saveAs();
    } else {
      try {
        const writable = await handler.createWritable();

        const db = await dbPromise;
        const tx = db.transaction(AGIFY_STORE, 'readonly')
        const store = tx.store;

        const agifyStructs = await store.getAll();

        console.log('Exportiere idb-Anwendungsdaten/JSON', agifyStructs);

        await writable.write(JSON.stringify(agifyStructs));

        tx.done;

        await writable.close();
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Function to call when the duplicate/save as button is triggered
   */
  async saveAs() {
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

      this.handler = handler;
      await this.db.put('settings', handler, 'handler');
      await this.save();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Reset the editor and file handler
   */
  async reset() {
    // this.editor.setContent('');
    this.handler = null;
    document.title = 'Offline-Anwendungsdaten';
    await this.db.delete('settings', 'handler');
  }
}
