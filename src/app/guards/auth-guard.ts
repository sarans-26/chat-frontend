import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const hasToken = document.cookie.split(';').some(c => c.trim().startsWith('token='));
  console.log("token",hasToken);
  if (hasToken) {
    // Redirect to chat if logged in
    return inject(Router).createUrlTree(['/chat']);
  }
  
  return true;
};
