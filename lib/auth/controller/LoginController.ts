import '../../http/response/RedirectResponse'
import { RedirectResponse } from '../../http/response/RedirectResponse'
import { AuthClass, ConfigurationKeys } from '../../constants'
import { ExpressController } from '../../http/controller/ExpressController'
import { Config } from '../../facades/global/ConfigFacade'
import { Response } from '../../facades/global/ResponseFacade'

export class LoginController extends ExpressController {
  getClassName() {
    return AuthClass.LoginController
  }

  protected getUrl(key: string): any {
    return Config.get(`${ConfigurationKeys.Auth.url}.${key}`)
  }

  async login(): Promise<RedirectResponse> {
    if (!this.auth.check()) {
      const attemptSuccess = await this.auth.attempt(this.input.all(), this.input.get('remember', false))
      if (!attemptSuccess) {
        return Response.redirect(this.getUrl('loginFailure')) as RedirectResponse
      }
    }
    return Response.redirect(this.getUrl('loginSuccess')) as RedirectResponse
  }

  async logout(): Promise<RedirectResponse> {
    if (this.auth.check()) {
      await this.auth.logout()
    }
    return Response.redirect(this.getUrl('logoutRedirect')) as RedirectResponse
  }
}
