import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Something went wrong. Please try again later.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = 'Unable to connect to server.';
      } else {
        // Backend error
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = 'Invalid request. Please check your inputs.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'Forbidden. You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Requested resource not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
        }
      }

      // Display the toast message for everything except 429 (which is handled with a local UI timer)
      if (error.status !== 429) {
        toastService.show(errorMessage, 'error');
      }

      // Re-throw the error so components can still handle specific logic (like stopping loading spinners)
      return throwError(() => error);
    })
  );
};
