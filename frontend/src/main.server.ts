import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, withRoutes, RenderMode } from '@angular/ssr';
import { App } from './app/app';
import { appConfig } from './app/app.config';

export default function bootstrap() {
  return bootstrapApplication(App, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      provideServerRendering(
        withRoutes([
          { path: '', renderMode: RenderMode.Server },
          { path: 'login', renderMode: RenderMode.Client },
          { path: 'forgot-password', renderMode: RenderMode.Client },
          { path: 'recuperar-password', renderMode: RenderMode.Client },
          { path: 'admin', renderMode: RenderMode.Client },
          { path: '**', renderMode: RenderMode.Client },
        ])
      )
    ]
  });
}
