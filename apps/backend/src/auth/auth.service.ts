import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type AuthInput = { email: string; password: string };
type SignInData = { userId: number; email: string }; // TODO Adjust signInData to get all needed data
type AuthResult = { accessToken: string; userId: number; email: string };

@Injectable()
export class AuthService {
  /* Injectable constructor goes here for priest users */
  constructor(private JwtService: JwtService) {}

  async authenticateParish(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateParish(input);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async authenticateAdmin(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateAdmin(input);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async validateParish(input: AuthInput): Promise<SignInData | null> {
    /* Fetch user here from database to find if it exists. 
           If not found return null or if it exists return all data needed.
           Test the password using hash function test.
        */
    return null;
  }

  async validateAdmin(input: AuthInput): Promise<SignInData | null> {
    /* Fetch user here from database to find if it exists. 
           If not found return null or if it exists return all data needed.
           Test the password using hash function test.
        */
    return null;
  }

  async signIn(user: SignInData): Promise<AuthResult> {
    const tokenPayload = {
      // This spot needs to get out all needed information that we could use later maybe for validating.
      sub: 2,
      email: 'user@example.com',
    };

    const accessToken = await this.JwtService.signAsync(tokenPayload);

    return {
      accessToken,
      userId: 1,
      email: 'user@example.com',
    };
  }
}
