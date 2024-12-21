import { Component, inject, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { routes } from '../app.routes';
import { Route, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Workbox, messageSW } from 'workbox-window';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterLink,
    RouterLinkActive
  ]
})
export class NavigationComponent implements OnInit {
  rootRoutes: Route[] = routes.filter(r => r.path);

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');

      const showSkipWaitingPrompt = (event: any) => {
        let snackBarRef = this.snackBar.open(
          'A new version of the website is available',
          'Reload page',
          {
            duration: 5000
          }
        );

        // Displaying prompt

        snackBarRef.onAction().subscribe(() => {
          // Assuming the user accepted the update, set up a listener
          // that will reload the page as soon as the previously waiting
          // service worker has taken control.
          wb.addEventListener('controlling', () => {
            window.location.reload();
          });

          // This will postMessage() to the waiting service worker.
          wb.messageSkipWaiting();
        });
      };

      // Add an event listener to detect when the registered
      // service worker has installed but is waiting to activate.
      wb.addEventListener('waiting', showSkipWaitingPrompt);

      wb.register()
        .then((reg) => {
          console.log('Successful service worker registration', reg);
        })
        .catch((err) =>
          console.error('Service worker registration failed', err)
        );
    } else {
      console.error('Service Worker API is not supported in current browser');
    }
  }
}
