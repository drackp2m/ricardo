import { url } from './config.js';
import { Logger } from './logger.js';
import { sessionManager } from './session-manager.js';
import { isPathInRouteList, navigateTo } from './utils.js';

/**
 * @returns {Promise<boolean>}
 */
export async function redirectByUserStatus() {
  const isLoggedIn = sessionManager.isLoggedIn();

  const loggedInForbiddenPaths = ['/page/login', '/page/register*'];
  const isInForbiddenPath = isPathInRouteList(location.pathname, loggedInForbiddenPaths);

  if (isLoggedIn === false && isInForbiddenPath === false) {
    return navigateTo('/page/login');
  } else if (isLoggedIn === false) {
    return false;
  }

  // const isLogoutPath = isPathInRouteList(location.pathname, ['/page/logout']);

  // if (isLogoutPath === true) {
  //   return false;
  // }

  const isActive = await sessionManager.hasStatus('ACTIVE');

  if (isActive === false) {
    return navigateTo('/page/status');
  }

  if (isPathInRouteList(location.pathname, loggedInForbiddenPaths) === true) {
    return navigateTo('/page/clock-in');
  }

  const isInitialCheckCompleted = sessionManager.isInitialCheckCompleted();
  const isInBasePath = isPathInRouteList(location.pathname, [url.basePathname]);

  if (isInitialCheckCompleted === true && isInBasePath === true) {
    return navigateTo('/page/clock-in');
  }

  return false;
}
