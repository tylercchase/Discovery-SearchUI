import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { download, Download } from './download';
import { Observable } from 'rxjs';
import { SAVER, Saver } from '@services/saver.provider';

@Injectable({providedIn: 'root'})
export class DownloadService {

  constructor(
    private http: HttpClient,
    @Inject(SAVER) private save: Saver
  ) {
  }

  download(): Observable<Download> {
    // tslint:disable-next-line:max-line-length
    // const url = 'https://grfn-test.asf.alaska.edu/door/browse/S1-GUNW-A-R-004-tops-20150825_20150310-230613-37822N_35782N-PP-43bb-v2_0_4.png';
    // const filename = 'S1-GUNW-A-R-004-tops-20150825_20150310-230613-37822N_35782N-PP-43bb-v2_0_4.png';
    const url = 'https://grfn-test.asf.alaska.edu/door/download/S1-GUNW-A-R-014-tops-20200513_20200419-153046-28315N_26591N-PP-e3ef-v2_0_3.nc';
    const filename = 'grfn-test.asf.alaska.edu/door/download/S1-GUNW-A-R-014-tops-20200513_20200419-153046-28315N_26591N-PP-e3ef-v2_0_3.nc';
    return this.http.get(url, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    }).pipe(download(blob => this.save(blob, filename)));
  }


  // blob(url: string, filename?: string): Observable<Blob> {
  blob(url: string): Observable<Blob> {
    return this.http.get(url, {
      withCredentials: true,
      responseType: 'blob'
    });
  }
}
