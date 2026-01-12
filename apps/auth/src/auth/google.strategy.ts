import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-google-oauth20';

export interface GoogleProfile {
  email: string;
  firstname?: string;
  lastname?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientId = config.get('GOOGLE_CLIENT_ID') || 'disabled';
    const clientSecret = config.get('GOOGLE_CLIENT_SECRET') || 'disabled';
    const callbackUrl =
      config.get('GOOGLE_CALLBACK_URL') ||
      'http://localhost:7081/api/auth/oauth2/callback/google';

    super({
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): GoogleProfile {
    const email = profile.emails?.[0]?.value || '';
    return {
      email,
      firstname: profile.name?.givenName,
      lastname: profile.name?.familyName,
    };
  }
}
